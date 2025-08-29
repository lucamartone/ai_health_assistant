from fastapi import APIRouter, HTTPException, Query, Response
from backend.router_profile.pydantic.schemas import RegisterDoctorRequest, LoginRequest
from backend.router_profile.account_profile import validate_password
from backend.connection import execute_query
from passlib.context import CryptContext
from datetime import datetime, timedelta
import base64
from backend.router_profile.pydantic.schemas import ModifyProfileRequest
from backend.router_profile.cookies_login import create_access_token, create_refresh_token

router_doctor_profile = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router_doctor_profile.post("/register")
async def register(data: RegisterDoctorRequest):
    """Endpoint per registrare un nuovo dottore."""
    try:
        # Validate password strength
        if not validate_password(data.password):
            raise HTTPException(
                status_code=400,
                detail="La password deve contenere almeno 8 caratteri, una lettera maiuscola, una minuscola e un numero"
            )

        # Check if email already exists
        check_email = """SELECT id FROM account WHERE email = %s"""
        if execute_query(check_email, (data.email,)):
            raise HTTPException(status_code=400, detail="Email già registrata")

        # Hash password
        hashed_password = pwd_context.hash(data.password)

        reg_query = """
        INSERT INTO account (
            name, surname, email, password, sex, role,
            created_at, last_login_attempt, failed_attempts
        ) VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, NULL, 0)
        RETURNING id
        """
        
        params = (data.name, data.surname, data.email, hashed_password, data.sex, "doctor")
        result = execute_query(reg_query, params, commit=True)

        if not result or not result[0]:
            raise HTTPException(status_code=500, detail="Errore durante la creazione dell'utente")
        id_doctor = result[0][0]

        reg_query = """
        INSERT INTO doctor (
            id, specialization
        ) VALUES (%s, %s)
        """

        params = (id_doctor, data.specialization)
        execute_query(reg_query, params, commit=True)

        reg_query = """
        INSERT INTO location (
            doctor_id, address, latitude, longitude
        ) VALUES (%s, %s, %s, %s)
        """

        for loc in data.locations:
            params = (id_doctor, loc.address, loc.latitude, loc.longitude)
            execute_query(reg_query, params, commit=True)

    
        return {
            "message": "Registrazione completata con successo",
            "account_id": id_doctor
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nella registrazione: {str(e)}")

@router_doctor_profile.post("/login")
async def login(data: LoginRequest, response: Response):
    try:
        print(f"Tentativo di login per email: {data.email}")
        
        # 1) Account base
        query_account = """
        SELECT a.id, a.name, a.surname, a.email, a.password, a.profile_img,
               a.last_login_attempt, a.failed_attempts, a.phone, a.role
        FROM account a
        JOIN doctor d ON a.id = d.id
        WHERE a.email = %s
        """
        results = execute_query(query_account, (data.email,))
        print(f"Risultati query account: {results}")
        
        if not results:
            raise HTTPException(status_code=404, detail="Account non registrato")

        account = results[0]
        account_id = account[0]
        name = account[1]
        surname = account[2]
        email = account[3]
        db_password = account[4]
        profile_img = account[5]
        last_attempt = account[6]
        failed_attempts = account[7] or 0
        phone = account[8]
        role = account[9]

        # 2) Controllo lockout
        if failed_attempts >= 5 and last_attempt:
            lockout_time = last_attempt + timedelta(minutes=15)
            if datetime.now() < lockout_time:
                raise HTTPException(
                    status_code=429,
                    detail=f"Account temporaneamente bloccato. Riprova dopo {lockout_time}"
                )

        # 3) Verifica password
        print(f"Verifica password per email: {data.email}")
        print(f"Password nel DB (primi 10 caratteri): {db_password[:10] if db_password else 'None'}")
        
        if not pwd_context.verify(data.password, db_password):
            print(f"Password errata per email: {data.email}")
            execute_query(
                "UPDATE account SET failed_attempts = failed_attempts + 1, last_login_attempt = CURRENT_TIMESTAMP WHERE email = %s",
                (data.email,), commit=True
            )
            raise HTTPException(status_code=401, detail="Password errata")
        
        print(f"Password corretta per email: {data.email}")

        # Reset tentativi falliti
        execute_query(
            "UPDATE account SET failed_attempts = 0, last_login_attempt = CURRENT_TIMESTAMP WHERE email = %s",
            (data.email,), commit=True
        )

        # 4) Specialization e addresses (solo per doctor)
        specialization = None
        addresses = []
        if role == "doctor":
            print(f"Recupero dati dottore per ID: {account_id}")
            
            res_doc = execute_query("SELECT specialization FROM doctor WHERE id = %s", (account_id,))
            specialization = res_doc[0][0] if res_doc else None
            print(f"Specializzazione: {specialization}")

            res_loc = execute_query("""
                SELECT address, latitude, longitude
                FROM location
                WHERE doctor_id = %s
                ORDER BY id
            """, (account_id,))
            print(f"Locations trovate: {res_loc}")
            
            addresses = [
                {
                    "address": r[0],
                    "latitude": float(r[1]) if r[1] else None,
                    "longitude": float(r[2]) if r[2] else None
                }
                for r in res_loc or []
            ]
            print(f"Addresses processate: {addresses}")

        # 5) Immagine profilo in base64
        profile_img_base64 = (
            f"data:image/png;base64,{base64.b64encode(profile_img).decode()}"
            if profile_img else None
        )

        # 6) Payload per i token
        token_payload = {
            "sub": email,
            "id": account_id,
            "name": name,
            "surname": surname,
            "email": email,
            "role": role,
            "phone": phone,
            "specialization": specialization,
            "addresses": addresses
        }

        # 7) Crea i token
        access_token = create_access_token(token_payload.copy())
        refresh_token = create_refresh_token(token_payload.copy())

        # 8) Imposta i cookie
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=3600,
            samesite="Strict",
            secure=False,  # Cambiare a True in produzione
            path="/"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            max_age=7 * 24 * 3600,
            samesite="Strict",
            secure=False,  # Cambiare a True in produzione
            path="/"
        )

        # 9) Risposta JSON identica a /me
        return {
            "message": "Login riuscito",
            "account": {
                "id": account_id,
                "name": name,
                "surname": surname,
                "email": email,
                "phone": phone,
                "role": role,
                "specialization": specialization,
                "addresses": addresses,
                "profile_img": profile_img_base64
            }
        }

    except HTTPException as he:
        print(f"HTTPException nel login: {he}")
        raise he
    except Exception as e:
        print(f"Errore generico nel login: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Errore interno: {str(e)}")

@router_doctor_profile.post("/edit_profile")
async def edit_profile(data: ModifyProfileRequest):
    try:
        # Aggiorna i dati di base
        query = """
            UPDATE account
            SET name = %s,
                surname = %s,
                phone = %s
            WHERE email = %s
        """
        params = (data.name, data.surname, data.phone, data.email)
        execute_query(query, params, commit=True)

        query = """
            UPDATE doctor
            SET specialization = %s
            WHERE id = (SELECT id FROM account WHERE email = %s)
        """
        params = (data.specialization, data.email)
        execute_query(query, params, commit=True)

        # Aggiungi solo le nuove location (non rimuovere quelle esistenti)
        if data.addresses is not None and len(data.addresses) > 0:
            # Trova l'id del doctor
            res = execute_query("SELECT id FROM account WHERE email = %s", (data.email,))
            if not res:
                raise HTTPException(status_code=404, detail="Utente non trovato")
            doctor_id = res[0][0]

            # Ottieni le location esistenti
            existing_locations = execute_query(
                "SELECT address, latitude, longitude FROM location WHERE doctor_id = %s",
                (doctor_id,)
            )
            existing_addresses = set()
            for loc in existing_locations or []:
                existing_addresses.add((loc[0], loc[1], loc[2]))

            # Inserisci solo le nuove location (non duplicate)
            insert_loc = """
                INSERT INTO location (doctor_id, address, latitude, longitude)
                VALUES (%s, %s, %s, %s)
            """
            for loc in data.addresses:
                # Verifica che l'indirizzo non sia vuoto e non sia già presente
                if (loc.address and loc.address.strip() and 
                    (loc.address, loc.latitude, loc.longitude) not in existing_addresses):
                    try:
                        execute_query(
                            insert_loc,
                            (doctor_id, loc.address, loc.latitude, loc.longitude),
                            commit=True
                        )
                    except Exception as e:
                        # Se c'è un errore di duplicato, ignoralo
                        print(f"DEBUG: Errore inserimento location (probabilmente duplicato): {e}")
                        pass

        # Aggiorna l'immagine se presente
        if data.profile_img:
            try:
                img_bytes = base64.b64decode(data.profile_img.split(",")[-1])
                query_img = "UPDATE account SET profile_img = %s WHERE email = %s"
                execute_query(query_img, (img_bytes, data.email), commit=True)
            except Exception as img_err:
                raise HTTPException(status_code=400, detail="Errore durante la decodifica dell'immagine profilo")
        else:
            try:
                query_img = "UPDATE account SET profile_img = NULL WHERE email = %s"
                execute_query(query_img, (data.email,), commit=True)
            except Exception as img_err:
                raise HTTPException(status_code=400, detail="Errore durante la rimozione dell'immagine profilo")


        return {"message": "Dati aggiornati con successo"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'aggiornamento: {str(e)}")

@router_doctor_profile.get("/appointments")
async def get_doctor_appointments(doctor_id: int = Query(..., gt=0, description="ID del dottore")):
    """Restituisce tutti gli appuntamenti del dottore (futuri e passati)."""
    try:
        query = """
        SELECT
          a.id AS appointment_id,
          a.date_time,
          a.price,
          a.status,
          l.address,
          l.city,
          p.id AS patient_id,
          u.name AS patient_name,
          u.surname AS patient_surname
        FROM appointment a
        JOIN location l ON a.location_id = l.id
        LEFT JOIN patient p ON a.patient_id = p.id
        LEFT JOIN account u ON p.id = u.id
        WHERE a.doctor_id = %s
        ORDER BY a.date_time DESC
        """
        raw_result = execute_query(query, (doctor_id,))
        columns = [
            "appointment_id", "date_time", "price", "status", "address", "city",
            "patient_id", "patient_name", "patient_surname"
        ]
        result = [dict(zip(columns, row)) for row in raw_result]
        return {"appointments": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero appuntamenti: {str(e)}")
    
@router_doctor_profile.get("/get_stats")
async def get_stats(doctor_id: int = Query(..., gt=0, description="ID del dottore")):
    try:
        query = """
            SELECT
                COUNT(*) AS total_appointments,
                COUNT(*) FILTER (WHERE status IN ('terminated', 'completed')) AS completed_appointments,
                COUNT(*) FILTER (WHERE status = 'booked' AND date_time > NOW()) AS upcoming_appointments,
                COUNT(DISTINCT patient_id) AS patients_count
                FROM appointment
            WHERE doctor_id = %s;

        """
        result = execute_query(query, (doctor_id,))
        if not result:
            return {
                "total_appointments": 0,
                "completed_appointments": 0,
                "upcoming_appointments": 0,
                "patient_visited": 0,
                "last_visit": None
            }
        
        stats = result[0]
        return {
            "total_appointments": stats[0],
            "completed_appointments": stats[1],
            "upcoming_appointments": stats[2],
            "patient_visited": stats[3],
            "last_visit": "N/A"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il recupero delle statistiche: {str(e)}")