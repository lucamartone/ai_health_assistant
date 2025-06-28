from fastapi import APIRouter, HTTPException, Query, Body
from typing import Optional
from datetime import datetime
from backend.connection import execute_query
from backend.router_doctor.pydantic.doctor_basemodels import AppointmentInsert, AppointmentsRequest

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

@router_appointments.get("/get_appointments")
def get_appointments(data: AppointmentsRequest = Query(..., description="ID of the doctor")):
    """Recupera gli appuntamenti futuri di un dottore specifico."""
    try:
        query = """
        SELECT id, doctor_id, patient_id, location_id, date_time, price, state
        FROM appointment
        WHERE doctor_id = %s AND date_time >= NOW()
        ORDER BY date_time ASC
        """
        params = (data.doctor_id,)
        raw_result = execute_query(query, params)

        # Colonne da associare ai valori di ogni riga
        columns = ["id", "doctor_id", "patient_id", "location_id", "date_time", "price", "state"]
        appointments = [dict(zip(columns, row)) for row in raw_result]

        return {"appointments": appointments}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving appointments: {str(e)}")

@router_appointments.post("/insert_appointment")
def insert_appointment(data: AppointmentInsert):
    """Inserisce un nuovo appuntamento per un dottore specifico."""
    print("inserisco")
    try:
        query = """
        INSERT INTO appointment (doctor_id, location_id, date_time, state)
        VALUES (%s, %s, %s, %s)
        """
        params = (data.doctor_id, data.location_id, data.date_time, data.state)
        execute_query(query, params, commit=True)
        return {"message": "Appuntamento inserito con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore inserimento: {str(e)}")

@router_appointments.put("/book_appointment")
def book_appointment(data: dict = Body(...)):
    """Prenota un appuntamento per un paziente specifico."""
    try:
        query = """
        UPDATE appointment
        SET state = %s AND patient_id = %s
        WHERE doctor_id = %s AND date_time = %s
        """
        params = ('booked', data.patient_id, data.doctor_id, data.date_time,)
        execute_query(query, params)
        return {"message": "Stato aggiornato con successo"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Errore aggiornamento: {str(e)}")


