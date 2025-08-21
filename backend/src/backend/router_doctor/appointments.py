from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional, List
from datetime import datetime, timedelta, date, time
from backend.connection import execute_query
from backend.router_doctor.pydantic.doctor_basemodels import AppointmentInsert, AppointmentsRequest, AppointmentRemotion, BulkGenerateSlots, BulkClearSlots

router_appointments = APIRouter()

@router_appointments.get("/get_locations")
def get_locations(data: AppointmentsRequest = Query(..., description="ID of the doctor")):
    """Recupera il numero di sedi associate a un dottore specifico."""
    try:
        query = """
        SELECT * FROM location WHERE doctor_id = %s
        """
        params = (data.doctor_id,)
        raw_result = execute_query(query, params)

        # Colonne da associare ai valori di ogni riga
        columns = ["id", "doctor_id", "address", "city", "province", "latitude", "longitude"]
        locations = [dict(zip(columns, row)) for row in raw_result]

        return {"locations": locations, "num": len(locations)}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving locations number: {str(e)}")

@router_appointments.get("/get_appointments")    # 
def get_appointments(data: AppointmentsRequest = Query(..., description="ID of the doctor")):
    """Recupera gli appuntamenti futuri di un dottore specifico."""
    try:
        query = """
        SELECT id, doctor_id, patient_id, location_id, date_time, price, status
        FROM appointment
        WHERE doctor_id = %s AND date_time >= NOW()
        ORDER BY date_time ASC
        """
        params = (data.doctor_id,)
        raw_result = execute_query(query, params)

        # Colonne da associare ai valori di ogni riga
        columns = ["id", "doctor_id", "patient_id", "location_id", "date_time", "price", "status"]
        appointments = [dict(zip(columns, row)) for row in raw_result]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")


@router_appointments.get("/get_booked")
def get_doctor_booked(doctor_id: int = Query(..., gt=0, description="ID of the doctor")):
    """Recupera gli appuntamenti prenotati e futuri per un dottore."""
    try:
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
def get_doctor_history(doctor_id: int = Query(..., gt=0, description="ID of the doctor")):
    """Recupera gli appuntamenti passati (completati) del dottore."""
    try:
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
    """Genera appuntamenti 'waiting' in blocco secondo fasce orarie e giorni selezionati."""
    try:
        # Costruisci tutti gli slot
        slots_to_insert: List[tuple] = []

        current_day = payload.start_date
        while current_day <= payload.end_date:
            if current_day.weekday() in payload.weekdays:
                # parse times
                start_hour, start_minute = map(int, payload.start_time.split(':'))
                end_hour, end_minute = map(int, payload.end_time.split(':'))
                start_dt = datetime.combine(current_day, time(start_hour, start_minute))
                end_dt = datetime.combine(current_day, time(end_hour, end_minute))

                dt = start_dt
                while dt < end_dt:
                    # Controllo: non creare slot nel passato
                    if dt > datetime.now():
                        for location_id in payload.location_ids:
                            slots_to_insert.append((payload.doctor_id, location_id, dt))
                    dt += timedelta(minutes=payload.slot_minutes)
            current_day += timedelta(days=1)

        # Inserisci evitando duplicati su (doctor_id, location_id, date_time)
        insert_query = """
            INSERT INTO appointment (doctor_id, location_id, date_time, status)
            VALUES (%s, %s, %s, 'waiting')
            ON CONFLICT DO NOTHING
        """

        # Esegui batch insert
        for chunk_start in range(0, len(slots_to_insert), 100):
            chunk = slots_to_insert[chunk_start:chunk_start+100]
            for doctor_id, location_id, dt in chunk:
                execute_query(insert_query, (doctor_id, location_id, dt), commit=True)

        return {"message": "Slot generati", "inserted": len(slots_to_insert)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella generazione degli slot: {str(e)}")


@router_appointments.post('/clear_slots')
def clear_slots(payload: BulkClearSlots):
    """Rimuove slot nel range specificato. Per default solo 'waiting' (non prenotati)."""
    try:
        params: List = [payload.doctor_id, payload.start_date, payload.end_date]
        where = [
            "doctor_id = %s",
            "date_time >= %s",
            "date_time < %s + INTERVAL '1 day'",
        ]

        if payload.location_ids:
            where.append(f"location_id = ANY(%s)")
            params.append(payload.location_ids)

        if payload.only_status:
            where.append("status = %s")
            params.append(payload.only_status)

        query = f"""
            DELETE FROM appointment
            WHERE {' AND '.join(where)}
        """
        execute_query(query, tuple(params), commit=True)
        return {"message": "Slot rimossi"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore nella rimozione degli slot: {str(e)}")

@router_appointments.post("/insert_appointment")
def insert_appointment(data: dict):
    """Inserisce un nuovo appuntamento per un dottore specifico."""
    print("inserisco")
    try:
        query = """
        INSERT INTO appointment (doctor_id, location_id, date_time, status)
        VALUES (%s, %s, %s, %s)
        """
        params = (data["doctor_id"], data["location_id"], data["date_time"], data["status"])
        execute_query(query, params, commit=True)
        return {"message": "Appuntamento inserito con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore inserimento: {str(e)}")

@router_appointments.post("/remove_appointment")
def remove_appointment(data: AppointmentRemotion = Body(...)):
    """Rimuove un appuntamento specifico."""
    try:
        query = """
        DELETE FROM appointment
        WHERE doctor_id = %s AND location_id = %s AND date_time = %s
        """

        params = (data.doctor_id, data.location_id, data.date_time)
        execute_query(query, params, commit=True)
        return {"message": "Appuntamento rimosso con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore rimozione: {str(e)}")

@router_appointments.post("/reload")
def reload():
    """Contrassegna gli appuntamenti come passati."""
    try:
        query = """
        UPDATE appointment
        SET status = 'terminated'
        WHERE date_time < NOW()
        """
        execute_query(query, commit=True)
        return {"message": "Appuntamenti ricaricati con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore durante il ricaricamento: {str(e)}")