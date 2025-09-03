"""
Sistema di visualizzazione e ranking dei dottori per i pazienti.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Visualizzare tutti i dottori disponibili
- Applicare filtri per specializzazione, prezzo e posizione
- Calcolare ranking complessivo basato su multiple metriche
- Ordinare i dottori per diversi criteri
- Gestire la ricerca e filtraggio avanzato

Il sistema implementa un algoritmo di ranking complessivo che considera:
- Distanza dal paziente
- Rating medio dalle recensioni
- Anni di esperienza
- Prezzo delle visite
- Disponibilità di appuntamenti
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List
from backend.connection import execute_query

from backend.router_patient.pydantic.schemas import DoctorQueryRequest, LimitInfo, PatientInfoRequest

# Router per la visualizzazione e ranking dei dottori
router_show_doctors = APIRouter()

@router_show_doctors.get("/get_all_doctors")
async def get_all_doctors(data: LimitInfo = Depends()) -> List[dict]:
    """
    Recupera tutti i dottori disponibili nel sistema.
    
    Questa funzione restituisce una lista completa di tutti i dottori
    registrati, ordinati per ranking decrescente, con informazioni
    base su specializzazione, sedi e prezzi.
    
    Args:
        limit: Numero massimo di dottori da restituire (1-100, default: 50)
        
    Returns:
        list: Lista di dottori con informazioni complete
        
    Raises:
        Exception: In caso di errori del database
    """

    try:
        # Query per recuperare tutti i dottori con informazioni complete
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            l.latitude,
            l.longitude,
            l.address,
            l.city,
            COALESCE(MIN(a.price), 50) as price
        FROM doctor d
        JOIN account u ON d.id = u.id
        LEFT JOIN location l ON l.doctor_id = d.id
        LEFT JOIN appointment a ON a.doctor_id = d.id AND a.status = 'waiting'
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude, l.address, l.city
        ORDER BY d.rank DESC
        LIMIT %s;
        """

        raw_result = execute_query(query, (data.limit,))

        # Mappatura delle colonne del database ai nomi dei campi
        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "price"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        return {"error": str(e)}

@router_show_doctors.get("/get_ranked_doctors")
async def get_ranked_doctors(data: DoctorQueryRequest = Depends()) -> List[dict]:
    """
    Recupera dottori con ranking complessivo basato su multiple metriche.
    
    Questa funzione implementa un sistema di ranking avanzato che considera:
    - Distanza dalla posizione del paziente
    - Rating medio dalle recensioni
    - Anni di esperienza (basati sulla data di creazione account)
    - Prezzo delle visite
    - Disponibilità di appuntamenti
    
    Args:
        latitude: Latitudine del paziente per il calcolo della distanza
        longitude: Longitudine del paziente per il calcolo della distanza
        specialization: Filtro opzionale per specializzazione medica
        min_price: Prezzo minimo per il filtro
        max_price: Prezzo massimo per il filtro
        sort_by: Criteri di ordinamento disponibili
        limit: Numero massimo di risultati da restituire
        
    Returns:
        list: Lista di dottori ordinati secondo i criteri specificati
        
    Raises:
        HTTPException: In caso di errori nei parametri o del database
    """

    try:
        # Query base con tutti i fattori di ranking
        base_query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            l.latitude,
            l.longitude,
            l.address,
            l.city,
            COALESCE(MIN(a.price), 50) as price,
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.created_at)) as years_experience,
            COALESCE(AVG(r.stars), 0) as avg_rating,
            COUNT(r.id) as review_count,
            COUNT(CASE WHEN a.status = 'waiting' THEN 1 END) as available_slots
        """
        
        # Calcolo della distanza se le coordinate sono fornite
        if data.latitude is not None and data.longitude is not None:
            base_query += f""",
            (6371 * acos(cos(radians({data.latitude})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians({data.longitude})) + sin(radians({data.latitude})) * sin(radians(l.latitude)))) AS distance_km
            """
        else:
            base_query += ", NULL as distance_km"
        
        base_query += """
        FROM doctor d
        JOIN account u ON d.id = u.id
        LEFT JOIN location l ON l.doctor_id = d.id
        LEFT JOIN appointment a ON a.doctor_id = d.id
        LEFT JOIN review r ON r.appointment_id = a.id
        """
        
        # Condizioni WHERE per i filtri applicati
        where_conditions = []
        params = []

        if data.specialization:
            where_conditions.append("d.specialization = %s")
            params.append(data.specialization)

        if data.min_price is not None:
            where_conditions.append("a.price >= %s")
            params.append(data.min_price)

        if data.max_price is not None:
            where_conditions.append("a.price <= %s")
            params.append(data.max_price)

        if where_conditions:
            base_query += " WHERE " + " AND ".join(where_conditions)
        
        base_query += """
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude, l.address, l.city, u.created_at
        """
        
        # Ordinamento basato sui criteri specificati
        if data.sort_by == "distance" and data.latitude is not None and data.longitude is not None:
            base_query += " ORDER BY distance_km ASC"
        elif data.sort_by == "rating":
            base_query += " ORDER BY avg_rating DESC, review_count DESC"
        elif data.sort_by == "experience":
            base_query += " ORDER BY years_experience DESC"
        elif data.sort_by == "price":
            base_query += " ORDER BY price ASC"
        elif data.sort_by == "availability":
            base_query += " ORDER BY available_slots DESC"
        else:  # ranking complessivo - ordinamento semplice
            base_query += " ORDER BY avg_rating DESC, years_experience DESC, available_slots DESC"
        
        base_query += " LIMIT %s"
        params.append(data.limit)
        
        raw_result = execute_query(base_query, tuple(params))
        
        # Definizione delle colonne basate sulla presenza della distanza
        if data.latitude is not None and data.longitude is not None:
            columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "price", "years_experience", "avg_rating", "review_count", "available_slots", "distance_km"]
        else:
            columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "price", "years_experience", "avg_rating", "review_count", "available_slots", "distance_km"]
        
        result = []
        for row in raw_result:
            doctor = dict(zip(columns, row))
            # Arrotondamento dei valori numerici per una migliore visualizzazione
            if doctor.get("avg_rating") is not None:
                doctor["avg_rating"] = round(float(doctor["avg_rating"]), 1)
            if doctor.get("distance_km") is not None:
                doctor["distance_km"] = round(float(doctor["distance_km"]), 1)
            if doctor.get("years_experience") is not None:
                doctor["years_experience"] = int(doctor["years_experience"])
            result.append(doctor)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero dei dottori con ranking: {str(e)}")
    

@router_show_doctors.get("/get_free_doctors")
async def get_free_doctors(data: LimitInfo = Depends()) -> List[dict]:
    """
    Recupera dottori che hanno almeno un appuntamento libero.
    
    Questa funzione restituisce una lista di dottori che hanno
    almeno un appuntamento in stato 'waiting' associato a loro.
    
    Args:
        limit: Numero massimo di dottori da restituire (1-100, default: 50)
        
    Returns:
        list: Lista di dottori con informazioni base
        
    Raises:
        Exception: In caso di errori del database
    """

    try:
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            l.latitude,
            l.longitude
        FROM doctor d
        JOIN account u ON d.id = u.id
        JOIN appointment a ON a.doctor_id = d.id
        JOIN location l ON l.id = a.location_id
        WHERE a.status = 'waiting'
        ORDER BY d.rank DESC
        LIMIT %s;
        """

        raw_result = execute_query(query, (data.limit,))

        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        return {"error": str(e)} 
    
@router_show_doctors.get("/free_doctors_by_specialization")
async def get_doctors_by_specialization(data: DoctorQueryRequest = Depends()) -> List[dict]:
    """
    Recupera dottori che hanno almeno un appuntamento libero per una specializzazione specifica.
    
    Questa funzione restituisce una lista di dottori che hanno
    almeno un appuntamento in stato 'waiting' associato a loro
    per una specifica specializzazione.
    
    Args:
        specialization: Specializzazione medica per filtrare i dottori
        limit: Numero massimo di dottori da restituire (1-100, default: 50)
        
    Returns:
        list: Lista di dottori con informazioni base
        
    Raises:
        HTTPException: In caso di errori nei parametri o del database
    """

    try:
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            l.latitude,
            l.longitude
        FROM doctor d
        JOIN account u ON d.id = u.id
        JOIN appointment a ON a.doctor_id = d.id
        JOIN location l ON l.id = a.location_id
        WHERE d.specialization = %s
          AND a.status = 'waiting'
        ORDER BY d.rank DESC
        LIMIT %s;
        """
        raw_result = execute_query(query, (data.specialization, data.limit))

        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Errore nel recupero della disponibilità dei dottori")
    
    
@router_show_doctors.get("/free_doctors_by_specialization_priceASC")
async def get_doctors_by_priceASC(data: DoctorQueryRequest = Depends()) -> List[dict]:
    """
    Recupera dottori con almeno un appuntamento in attesa per una specializzazione, ordinati per prezzo crescente.
    
    Questa funzione restituisce una lista di dottori che hanno
    almeno un appuntamento in stato 'waiting' associato a loro
    per una specifica specializzazione, con prezzo minimo specificato.
    
    Args:
        specialization: Specializzazione medica per filtrare i dottori
        min_price: Prezzo minimo per il filtro
        max_price: Prezzo massimo opzionale per il filtro
        limit: Numero massimo di dottori da restituire (1-100, default: 50)
        
    Returns:
        list: Lista di dottori con prezzo minimo
        
    Raises:
        HTTPException: In caso di errori nei parametri o del database
    """

    try:
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            MIN(a.price) AS min_price,
            l.latitude,
            l.longitude
        FROM doctor d
        JOIN account u ON d.id = u.id
        JOIN appointment a ON a.doctor_id = d.id
        JOIN location l ON l.id = a.location_id
        WHERE d.specialization = %s
          AND a.status = 'waiting'
          AND a.price >= %s
        """
        params = [data.specialization, data.min_price]

        if data.max_price is not None:
            query += " AND a.price <= %s"
            params.append(data.max_price)

        query += """
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude
        ORDER BY min_price ASC
        LIMIT %s;
        """
        params.append(data.limit)

        raw_result = execute_query(query, tuple(params))
        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "min_price", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Errore nel recupero dei dottori per prezzo")


@router_show_doctors.get("/free_doctors_by_specialization_priceDESC")
async def get_doctors_by_priceDESC(data: DoctorQueryRequest = Depends()) -> List[dict]:
    """
    Recupera dottori con almeno un appuntamento in attesa per una specializzazione, ordinati per prezzo decrescente.
    
    Questa funzione restituisce una lista di dottori che hanno
    almeno un appuntamento in stato 'waiting' associato a loro
    per una specifica specializzazione, con prezzo massimo specificato.
    
    Args:
        specialization: Specializzazione medica per filtrare i dottori
        min_price: Prezzo minimo per il filtro
        max_price: Prezzo massimo opzionale per il filtro
        limit: Numero massimo di dottori da restituire (1-100, default: 50)
        
    Returns:
        list: Lista di dottori con prezzo massimo
        
    Raises:
        HTTPException: In caso di errori nei parametri o del database
    """

    try:
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            MAX(a.price) AS max_price,
            l.latitude,
            l.longitude
        FROM doctor d
        JOIN account u ON d.id = u.id
        JOIN appointment a ON a.doctor_id = d.id
        JOIN location l ON l.id = a.location_id
        WHERE d.specialization = %s
          AND a.status = 'waiting'
          AND a.price >= %s
        """
        params = [data.specialization, data.min_price]

        if data.max_price is not None:
            query += " AND a.price <= %s"
            params.append(data.max_price)

        query += """
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude
        ORDER BY max_price DESC
        LIMIT %s;
        """
        params.append(data.limit)

        raw_result = execute_query(query, tuple(params))
        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "max_price", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Errore nel recupero dei dottori per prezzo")


@router_show_doctors.get("/doctors_by_location")
async def get_doctors_by_location(data: DoctorQueryRequest = Depends()) -> list:
    """
    Recupera dottori entro un raggio specificato dalle coordinate.
    
    Questa funzione utilizza la formula di Haversine per trovare
    i dottori che si trovano entro un raggio specificato dalle coordinate
    di latitudine e longitudine del paziente.
    
    Args:
        latitude: Coordinate di latitudine
        longitude: Coordinate di longitudine
        radius_km: Raggio di ricerca in chilometri
        limit: Numero massimo di dottori da restituire (1-100, default: 50)
        
    Returns:
        list: Lista di dottori entro il raggio specificato
        
    Raises:
        HTTPException: In caso di errori nei parametri o del database
    """

    try:
        # Formula di Haversine per calcolare la distanza
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img,
            l.latitude,
            l.longitude,
            l.address,
            l.city,
            (6371 * acos(cos(radians(%s)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(%s)) + sin(radians(%s)) * sin(radians(l.latitude)))) AS distance_km
        FROM doctor d
        JOIN account u ON d.id = u.id
        JOIN appointment a ON a.doctor_id = d.id
        JOIN location l ON l.id = a.location_id
        WHERE a.status = 'waiting'
        HAVING distance_km <= %s
        ORDER BY distance_km ASC
        LIMIT %s;
        """

        raw_result = execute_query(query, (data.latitude, data.longitude, data.latitude, data.radius_km, data.limit))

        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "distance_km"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Errore nel recupero dei dottori per posizione")
    

@router_show_doctors.get("/patient_doctors")
async def get_patient_doctors(data: PatientInfoRequest = Depends()):
    """
    Recupera dottori associati a un paziente specifico attraverso appuntamenti o cartelle cliniche.
    
    Questa funzione recupera dottori che hanno avuto appuntamenti
    o che hanno cartelle cliniche associati al paziente specificato.
    
    Args:
        patient_id: ID del paziente
        
    Returns:
        dict: Dizionario contenente la lista di dottori associati
        
    Raises:
        HTTPException: In caso di errori nei parametri o del database
    """

    try:
        query = """
        SELECT DISTINCT 
            d.id,
            u.name,
            u.surname,
            d.specialization,
            u.email
        FROM doctor d
        JOIN account u ON d.id = u.id
        WHERE d.id IN (
            -- Dottori con cui il paziente ha avuto appuntamenti
            SELECT DISTINCT doctor_id 
            FROM appointment 
            WHERE patient_id = %s
            UNION
            -- Dottori che hanno cartelle cliniche del paziente
            SELECT DISTINCT doctor_id 
            FROM medical_record 
            WHERE clinical_folder_id IN (
                SELECT id FROM clinical_folder WHERE patient_id = %s
            )
        )
        ORDER BY u.name, u.surname;
        """

        raw_result = execute_query(query, (data.patient_id, data.patient_id))

        columns = ["id", "name", "surname", "specialization", "email"]
        result = []
        for row in raw_result:
            doctor = dict(zip(columns, row))
            result.append(doctor)
        
        return {"doctors": result}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Errore nel recupero dei dottori del paziente: {str(e)}")

