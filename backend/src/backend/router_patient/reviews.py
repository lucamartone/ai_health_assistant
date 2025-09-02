"""
Sistema di gestione delle recensioni per i pazienti.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Visualizzare appuntamenti completati da valutare
- Inserire e aggiornare recensioni per appuntamenti
- Recuperare la cronologia delle recensioni del paziente
- Gestire il sistema di rating e feedback

Il sistema permette ai pazienti di valutare i dottori dopo
gli appuntamenti completati, contribuendo al sistema di ranking.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List
from backend.connection import execute_query
from backend.router_patient.pydantic.schemas import Appointment, ReviewRequest

# Router per la gestione delle recensioni dei pazienti
router_reviews = APIRouter()

@router_reviews.get("/appointments_to_rank")
async def get_appointments_to_rank(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    """
    Recupera gli appuntamenti completati ma non ancora valutati da un paziente.
    
    Questa funzione identifica tutti gli appuntamenti che sono stati completati
    ma per i quali il paziente non ha ancora lasciato una recensione,
    permettendo di completare il processo di feedback.
    
    Args:
        patient_id: ID del paziente per cui recuperare gli appuntamenti da valutare
        
    Returns:
        dict: Dizionario contenente la lista degli appuntamenti da valutare
        
    Raises:
        HTTPException: In caso di errore nel recupero degli appuntamenti
    """
    try:
        # Query per recuperare appuntamenti completati senza recensioni
        query = ''' SELECT
                        a.id,
                        a.doctor_id,
                        acc.name AS doctor_name,
                        acc.surname AS doctor_surname,
                        d.specialization,
                        l.address,
                        l.city,
                        a.date_time,
                        a.price,
                        a.status,
                        a.created_at
                    FROM appointment a
                    JOIN doctor d ON a.doctor_id = d.id
                    JOIN account acc ON d.id = acc.id
                    JOIN location l ON a.location_id = l.id
                    LEFT JOIN review r ON r.appointment_id = a.id
                    WHERE
                        a.date_time < NOW()
                        AND a.status = 'completed'
                        AND r.stars IS NULL
                        AND a.patient_id = %s
                        ORDER BY a.date_time ASC;
                '''
        
        # Esecuzione della query per recuperare gli appuntamenti
        raw_result = execute_query(query, (patient_id,), commit = True)
        
        # Formattazione dei risultati in oggetti Appointment
        appointments: List[Appointment] = [
            Appointment(
                id=row[0],
                doctor_id=row[1],
                doctor_name=row[2],
                doctor_surname=row[3],
                specialization=row[4],
                address=row[5],
                city=row[6],
                date_time=row[7],
                price=float(row[8]),
                status=row[9],
                created_at=row[10]
            )
            for row in raw_result
        ]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero degli appuntamenti da valutare: {str(e)}")

# Alias per compatibilità con il frontend esistente
@router_reviews.get("/get_to_rank_appointments")
async def get_to_rank_appointments(id_patient: int = Query(..., gt=0, description="ID del paziente")):
    """
    Alias per get_appointments_to_rank per compatibilità con il frontend.
    
    Questa funzione mantiene la compatibilità con il frontend esistente
    utilizzando un nome di endpoint diverso ma la stessa logica.
    
    Args:
        id_patient: ID del paziente per cui recuperare gli appuntamenti da valutare
        
    Returns:
        dict: Dizionario contenente la lista degli appuntamenti da valutare
    """
    return await get_appointments_to_rank(id_patient)

@router_reviews.post("/review_appointment")
async def review_appointment(data: ReviewRequest):
    """
    Inserisce o aggiorna una recensione per un appuntamento completato.
    
    Questa funzione permette ai pazienti di valutare i dottori dopo
    gli appuntamenti completati. Se una recensione esiste già,
    viene aggiornata; altrimenti ne viene creata una nuova.
    
    Args:
        data: Oggetto contenente i dati della recensione (ID appuntamento, stelle, commento)
        
    Returns:
        dict: Messaggio di conferma dell'invio della recensione
        
    Raises:
        HTTPException: In caso di appuntamento non trovato, non completato o errori
    """
    try:
        # Verifica che l'appuntamento esista e sia completato
        query = """
            SELECT id FROM appointment WHERE id = %s AND status = 'completed'
        """
        raw_result = execute_query(query, (data.appointment_id,))
        
        if not raw_result:
            raise HTTPException(status_code=404, detail="Appuntamento non trovato o non completato.")

        # Verifica se esiste già una recensione per questo appuntamento
        check_review_query = """
            SELECT id FROM review WHERE appointment_id = %s
        """
        review_result = execute_query(check_review_query, (data.appointment_id,))
        
        if review_result:
            # Aggiornamento della recensione esistente
            update_query = """
                UPDATE review
                SET stars = %s, report = %s
                WHERE appointment_id = %s
            """
            execute_query(update_query, (data.stars, data.report, data.appointment_id), commit=True)
        else:
            # Creazione di una nuova recensione
            insert_query = """
                INSERT INTO review (appointment_id, stars, report)
                VALUES (%s, %s, %s)
            """
            execute_query(insert_query, (data.appointment_id, data.stars, data.report), commit=True)

        return {"message": "Recensione inviata con successo."}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nell'invio della recensione: {str(e)}")


@router_reviews.get("/patient_reviews")
async def get_patient_reviews(patient_id: int = Query(..., gt=0, description="ID del paziente")):
    """
    Recupera tutte le recensioni lasciate da un paziente specifico.
    
    Questa funzione restituisce la cronologia completa delle recensioni
    di un paziente, includendo informazioni sull'appuntamento, il dottore
    e la specializzazione, ordinata per data decrescente.
    
    Args:
        patient_id: ID del paziente per cui recuperare le recensioni
        
    Returns:
        dict: Dizionario contenente la lista delle recensioni del paziente
        
    Raises:
        HTTPException: In caso di errore nel recupero delle recensioni
    """
    try:
        # Query per recuperare tutte le recensioni del paziente con dettagli completi
        query = """
            SELECT
                r.id,
                r.appointment_id,
                r.stars,
                r.report,
                a.date_time,
                acc.name AS doctor_name,
                acc.surname AS doctor_surname,
                d.specialization
            FROM review r
            JOIN appointment a ON r.appointment_id = a.id
            JOIN doctor d ON a.doctor_id = d.id
            JOIN account acc ON d.id = acc.id
            WHERE a.patient_id = %s AND r.stars IS NOT NULL
            ORDER BY a.date_time DESC
        """
        
        raw_result = execute_query(query, (patient_id,))
        
        # Formattazione dei risultati con conversione delle date
        reviews = [
            {
                "id": row[0],
                "appointment_id": row[1],
                "stars": row[2],
                "report": row[3],
                "appointment_date": row[4].isoformat() if row[4] else None,
                "doctor_name": row[5],
                "doctor_surname": row[6],
                "specialization": row[7]
            }
            for row in raw_result
        ]

        return {"reviews": reviews}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero delle recensioni: {str(e)}")