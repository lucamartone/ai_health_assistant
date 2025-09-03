"""
Gestione completa degli appuntamenti per i dottori.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Recuperare informazioni sulle sedi di lavoro
- Gestire appuntamenti (visualizzazione, inserimento, rimozione)
- Generare slot di appuntamenti in blocco
- Gestire la cronologia degli appuntamenti
- Aggiornare lo stato degli appuntamenti
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List
from datetime import datetime, timedelta, date, time
from backend.connection import execute_query
from backend.router_doctor.pydantic.doctor_basemodels import AppointmentInsert, AppointmentsRequest, AppointmentRemotion, BulkGenerateSlots, BulkClearSlots

# Router per la gestione degli appuntamenti dei dottori
router_appointments = APIRouter()

@router_appointments.get("/get_locations")
def get_locations(data: AppointmentsRequest = Query(..., description="ID del dottore")):
    """
    Recupera tutte le sedi di lavoro associate a un dottore specifico.
    
    Args:
        data: Oggetto contenente l'ID del dottore
        
    Returns:
        dict: Dizionario con la lista delle sedi e il numero totale
        
    Raises:
        HTTPException: In caso di errore nel recupero delle sedi
    """
    try:
        # Query per recuperare tutte le sedi del dottore
        query = """
        SELECT * FROM location WHERE doctor_id = %s
        """
        params = (data.doctor_id,)
        raw_result = execute_query(query, params)

        # Mappatura delle colonne del database ai nomi dei campi
        columns = ["id", "doctor_id", "address", "city", "province", "latitude", "longitude"]
        locations = [dict(zip(columns, row)) for row in raw_result]

        return {"locations": locations, "num": len(locations)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero delle sedi: {str(e)}")

@router_appointments.get("/get_appointments")
def get_appointments(data: AppointmentsRequest = Query(..., description="ID del dottore")):
    """
    Recupera tutti gli appuntamenti futuri di un dottore specifico.
    
    Args:
        data: Oggetto contenente l'ID del dottore
        
    Returns:
        dict: Dizionario con la lista degli appuntamenti futuri
        
    Raises:
        HTTPException: In caso di errore nel recupero degli appuntamenti
    """
    try:
        # Query per recuperare appuntamenti futuri ordinati per data
        query = """
        SELECT id, doctor_id, patient_id, location_id, date_time, price, status
        FROM appointment
        WHERE doctor_id = %s AND date_time >= NOW()
        ORDER BY date_time ASC
        """
        params = (data.doctor_id,)
        raw_result = execute_query(query, params)

        # Mappatura delle colonne del database ai nomi dei campi
        columns = ["id", "doctor_id", "patient_id", "location_id", "date_time", "price", "status"]
        appointments = [dict(zip(columns, row)) for row in raw_result]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero degli appuntamenti: {str(e)}")


@router_appointments.get("/get_booked")
def get_doctor_booked(doctor_id: int = Query(..., gt=0, description="ID del dottore")):
    """
    Recupera tutti gli appuntamenti prenotati e futuri per un dottore specifico.
    
    Args:
        doctor_id: ID del dottore (deve essere maggiore di 0)
        
    Returns:
        dict: Dizionario con la lista degli appuntamenti prenotati
        
    Raises:
        HTTPException: In caso di errore nel recupero degli appuntamenti
    """
    try:
        # Query per recuperare appuntamenti prenotati con informazioni complete
        query = """
        SELECT 
            a.id,
            pacc.name AS patient_name,
            pacc.surname AS patient_surname,
            l.address,
            l.city,
            a.date_time,
            a.price,
            a.status
        FROM appointment a
        JOIN patient p ON a.patient_id = p.id
        JOIN account pacc ON p.id = pacc.id
        JOIN location l ON a.location_id = l.id
        WHERE a.doctor_id = %s 
          AND a.status = 'booked'
          AND a.date_time >= NOW()
        ORDER BY a.date_time ASC
        """
        raw_result = execute_query(query, (doctor_id,))
        
        # Mappatura delle colonne del database ai nomi dei campi
        columns = [
            "id",
            "patient_name",
            "patient_surname",
            "address",
            "city",
            "date_time",
            "price",
            "status",
        ]
        appointments = [dict(zip(columns, row)) for row in raw_result]
        return {"appointments": appointments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero degli appuntamenti prenotati del dottore: {str(e)}")


@router_appointments.get("/get_history_doctor")
def get_doctor_history(doctor_id: int = Query(..., gt=0, description="ID del dottore")):
    """
    Recupera la cronologia completa degli appuntamenti passati (completati) del dottore.
    
    Args:
        doctor_id: ID del dottore (deve essere maggiore di 0)
        
    Returns:
        dict: Dizionario con la lista degli appuntamenti completati
        
    Raises:
        HTTPException: In caso di errore nel recupero della cronologia
    """
    try:
        # Query per recuperare appuntamenti completati nel passato
        query = """
        SELECT 
            a.id,
            pacc.name AS patient_name,
            pacc.surname AS patient_surname,
            l.address,
            l.city,
            a.date_time,
            a.price,
            a.status,
            a.created_at
        FROM appointment a
        JOIN patient p ON a.patient_id = p.id
        JOIN account pacc ON p.id = pacc.id
        JOIN location l ON a.location_id = l.id
        WHERE a.doctor_id = %s 
          AND a.date_time < NOW()
          AND a.status = 'completed'
        ORDER BY a.date_time DESC
        """
        raw_result = execute_query(query, (doctor_id,))
        
        # Mappatura delle colonne del database ai nomi dei campi
        columns = [
            "id",
            "patient_name",
            "patient_surname",
            "address",
            "city",
            "date_time",
            "price",
            "status",
            "created_at",
        ]
        appointments = [dict(zip(columns, row)) for row in raw_result]
        return {"appointments": appointments}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nel recupero della cronologia appuntamenti del dottore: {str(e)}")


@router_appointments.post('/generate_slots')
def generate_slots(payload: BulkGenerateSlots):
    """
    Genera automaticamente slot di appuntamenti disponibili in blocco secondo i parametri specificati.
    
    Questa funzione crea slot di appuntamenti con status 'waiting' per le fasce orarie
    e i giorni selezionati, evitando duplicati e slot nel passato.
    
    Args:
        payload: Oggetto contenente i parametri per la generazione degli slot
        
    Returns:
        dict: Messaggio di conferma e numero di slot generati
        
    Raises:
        HTTPException: In caso di errore durante la generazione degli slot
    """
    try:
        # Inizializzazione della lista degli slot da inserire
        slots_to_insert: List[tuple] = []

        # Iterazione sui giorni nel range specificato
        current_day = payload.start_date
        while current_day <= payload.end_date:
            # Verifica se il giorno corrente è tra quelli selezionati
            if current_day.weekday() in payload.weekdays:
                # Parsing degli orari di inizio e fine
                start_hour, start_minute = map(int, payload.start_time.split(':'))
                start_hour -= 2
                end_hour, end_minute = map(int, payload.end_time.split(':'))
                end_hour -= 2
                start_dt = datetime.combine(current_day, time(start_hour, start_minute))
                end_dt = datetime.combine(current_day, time(end_hour, end_minute))

                # Generazione degli slot per il giorno corrente
                dt = start_dt
                while dt < end_dt:
                    # Controllo di sicurezza: non creare slot nel passato
                    if dt > datetime.now():
                        # Creazione di slot per ogni sede specificata
                        for location_id in payload.location_ids:
                            slots_to_insert.append((payload.doctor_id, location_id, dt))
                    dt += timedelta(minutes=payload.slot_minutes)
            current_day += timedelta(days=1)

        # Inserimento degli slot evitando duplicati su (doctor_id, location_id, date_time)
        insert_query = """
            INSERT INTO appointment (doctor_id, location_id, date_time, status)
            VALUES (%s, %s, %s, 'waiting')
            ON CONFLICT DO NOTHING
        """

        # Esecuzione dell'inserimento in batch per ottimizzare le performance
        for chunk_start in range(0, len(slots_to_insert), 100):
            chunk = slots_to_insert[chunk_start:chunk_start+100]
            for doctor_id, location_id, dt in chunk:
                execute_query(insert_query, (doctor_id, location_id, dt), commit=True)

        return {"message": "Slot generati con successo", "inserted": len(slots_to_insert)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella generazione degli slot: {str(e)}")


@router_appointments.post('/clear_slots')
def clear_slots(payload: BulkClearSlots):
    """
    Rimuove slot di appuntamenti nel range di date specificato.
    
    Per default rimuove solo gli slot con status 'waiting' (non prenotati),
    ma può essere configurato per rimuovere slot con status specifici.
    
    Args:
        payload: Oggetto contenente i parametri per la rimozione degli slot
        
    Returns:
        dict: Messaggio di conferma della rimozione
        
    Raises:
        HTTPException: In caso di errore durante la rimozione degli slot
    """
    try:
        # Parametri base per la query di rimozione
        params: List = [payload.doctor_id, payload.start_date, payload.end_date]
        where = [
            "doctor_id = %s",
            "date_time >= %s",
            "date_time < %s + INTERVAL '1 day'",
        ]

        # Aggiunta di filtri opzionali per sede e status
        if payload.location_ids:
            where.append(f"location_id = ANY(%s)")
            params.append(payload.location_ids)

        if payload.only_status:
            where.append("status = %s")
            params.append(payload.only_status)

        # Costruzione e esecuzione della query di rimozione
        query = f"""
            DELETE FROM appointment
            WHERE {' AND '.join(where)}
        """
        execute_query(query, tuple(params), commit=True)
        return {"message": "Slot rimossi con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella rimozione degli slot: {str(e)}")

@router_appointments.post("/insert_appointment")
def insert_appointment(data: dict):
    """
    Inserisce un nuovo appuntamento per un dottore specifico.
    
    Prima dell'inserimento verifica che non esista già un appuntamento
    per la stessa combinazione di dottore, sede e data/ora.
    
    Args:
        data: Dizionario contenente i dati dell'appuntamento
        
    Returns:
        dict: Messaggio di conferma o avviso di duplicato
        
    Raises:
        HTTPException: In caso di errore durante l'inserimento
    """
    try:
        # Verifica dell'esistenza di appuntamenti duplicati
        check_query = """
        SELECT id FROM appointment 
        WHERE doctor_id = %s AND location_id = %s AND date_time = %s
        """
        existing = execute_query(check_query, (data["doctor_id"], data["location_id"], data["date_time"]))
        
        if existing:
            return {"message": "Appuntamento già esistente per questa data e sede"}
        
        # Inserimento del nuovo appuntamento
        query = """
        INSERT INTO appointment (doctor_id, location_id, date_time, status)
        VALUES (%s, %s, %s, %s)
        """
        params = (data["doctor_id"], data["location_id"], data["date_time"], data["status"])
        execute_query(query, params, commit=True)
        return {"message": "Appuntamento inserito con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'inserimento: {str(e)}")

@router_appointments.post("/remove_appointment")
def remove_appointment(data: AppointmentRemotion = Body(...)):
    """
    Rimuove un appuntamento specifico dal sistema.
    
    Args:
        data: Oggetto contenente i parametri per identificare l'appuntamento
        
    Returns:
        dict: Messaggio di conferma della rimozione
        
    Raises:
        HTTPException: In caso di errore durante la rimozione
    """
    try:
        # Query per la rimozione dell'appuntamento
        query = """
        DELETE FROM appointment
        WHERE doctor_id = %s AND location_id = %s AND date_time = %s
        """

        params = (data.doctor_id, data.location_id, data.date_time)
        execute_query(query, params, commit=True)
        return {"message": "Appuntamento rimosso con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante la rimozione: {str(e)}")

@router_appointments.post("/reload")
def reload():
    """
    Aggiorna automaticamente lo stato degli appuntamenti passati.
    
    Questa funzione contrassegna come 'terminated' tutti gli appuntamenti
    la cui data è già passata, mantenendo aggiornato lo stato del sistema.
    
    Returns:
        dict: Messaggio di conferma dell'aggiornamento
        
    Raises:
        HTTPException: In caso di errore durante l'aggiornamento
    """
    try:
        # Query per aggiornare lo stato degli appuntamenti passati
        query = """
        UPDATE appointment
        SET status = 'terminated'
        WHERE date_time < NOW()
        """
        execute_query(query, commit=True)
        return {"message": "Stato degli appuntamenti aggiornato con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante l'aggiornamento: {str(e)}")