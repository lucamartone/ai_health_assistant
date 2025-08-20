from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.connection import execute_query
from datetime import datetime

router_show_doctors = APIRouter()

@router_show_doctors.get("/get_all_doctors")
async def get_all_doctors(
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
):
    """Endpoint to get all available doctors"""
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

        raw_result = execute_query(query, (limit,))

        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "price"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        return {"error": str(e)}

@router_show_doctors.get("/get_ranked_doctors")
async def get_ranked_doctors(
    latitude: Optional[float] = Query(None, ge=-90, le=90, description="Patient latitude for distance calculation"),
    longitude: Optional[float] = Query(None, ge=-180, le=180, description="Patient longitude for distance calculation"),
    specialization: Optional[str] = Query(None, min_length=2, max_length=50, description="Medical specialization filter"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    sort_by: Optional[str] = Query("comprehensive", description="Sorting criteria: distance, rating, experience, price, comprehensive"),
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
):
    """
    Get doctors with comprehensive ranking based on multiple factors:
    - Distance from patient location
    - Average rating from reviews
    - Years of experience (based on account creation)
    - Price
    - Availability of appointments
    """
    try:
        # Base query with all ranking factors
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
        
        # Distance calculation if coordinates provided
        if latitude is not None and longitude is not None:
            base_query += f""",
            (6371 * acos(cos(radians({latitude})) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians({longitude})) + sin(radians({latitude})) * sin(radians(l.latitude)))) AS distance_km
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
        
        # WHERE conditions
        where_conditions = []
        params = []
        
        if specialization:
            where_conditions.append("d.specialization = %s")
            params.append(specialization)
        
        if min_price is not None:
            where_conditions.append("a.price >= %s")
            params.append(min_price)
        
        if max_price is not None:
            where_conditions.append("a.price <= %s")
            params.append(max_price)
        
        if where_conditions:
            base_query += " WHERE " + " AND ".join(where_conditions)
        
        base_query += """
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude, l.address, l.city, u.created_at
        """
        
        # ORDER BY based on sort criteria
        if sort_by == "distance" and latitude is not None and longitude is not None:
            base_query += " ORDER BY distance_km ASC"
        elif sort_by == "rating":
            base_query += " ORDER BY avg_rating DESC, review_count DESC"
        elif sort_by == "experience":
            base_query += " ORDER BY years_experience DESC"
        elif sort_by == "price":
            base_query += " ORDER BY price ASC"
        elif sort_by == "availability":
            base_query += " ORDER BY available_slots DESC"
        else:  # comprehensive ranking - use simple ordering
            base_query += " ORDER BY avg_rating DESC, years_experience DESC, available_slots DESC"
        
        base_query += " LIMIT %s"
        params.append(limit)
        
        raw_result = execute_query(base_query, tuple(params))
        
        # Define columns based on whether distance is calculated
        if latitude is not None and longitude is not None:
            columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "price", "years_experience", "avg_rating", "review_count", "available_slots", "distance_km"]
        else:
            columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "price", "years_experience", "avg_rating", "review_count", "available_slots", "distance_km"]
        
        result = []
        for row in raw_result:
            doctor = dict(zip(columns, row))
            # Round numeric values for better display
            if doctor.get("avg_rating") is not None:
                doctor["avg_rating"] = round(float(doctor["avg_rating"]), 1)
            if doctor.get("distance_km") is not None:
                doctor["distance_km"] = round(float(doctor["distance_km"]), 1)
            if doctor.get("years_experience") is not None:
                doctor["years_experience"] = int(doctor["years_experience"])
            result.append(doctor)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving ranked doctors: {str(e)}")

@router_show_doctors.get("/get_free_doctors")
async def get_free_doctors(
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
):
    """Endpoint to get doctors who have at least one free appointment"""
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

        raw_result = execute_query(query, (limit,))

        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        return {"error": str(e)} 
    
@router_show_doctors.get("/free_doctors_by_specialization")
async def get_doctors_by_specialization(
    specialization: str = Query(..., min_length=2, max_length=50, description="Medical specialization to filter doctors"),
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
):
    """Endpoint to get doctors who have at least one free appointment for a given specialization."""
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
        raw_result = execute_query(query, (specialization, limit))

        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctor availability")
    
@router_show_doctors.get("/free_doctors_by_specialization_priceASC")
async def get_doctors_by_priceASC(
    specialization: str = Query(..., min_length=2, max_length=50, description="Medical specialization to filter doctors"),
    min_price: Optional[float] = Query(default=0, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(default=None, ge=0, description="Maximum price filter"),
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
) -> List[dict]:
    """Get doctors with at least one waiting appointment in a given specialization, ordered by lowest price."""
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
        params = [specialization, min_price]
        
        if max_price is not None:
            query += " AND a.price <= %s"
            params.append(max_price)
            
        query += """
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude
        ORDER BY min_price ASC
        LIMIT %s;
        """
        params.append(limit)
        
        raw_result = execute_query(query, tuple(params))
        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "min_price", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctors by price")


@router_show_doctors.get("/free_doctors_by_specialization_priceDESC")
async def get_doctors_by_priceDESC(
    specialization: str = Query(..., min_length=2, max_length=50, description="Medical specialization to filter doctors"),
    min_price: Optional[float] = Query(default=0, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(default=None, ge=0, description="Maximum price filter"),
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
) -> List[dict]:
    """Endpoint to get doctors with available visits in given specialization, ordered by highest price."""
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
        params = [specialization, min_price]
        
        if max_price is not None:
            query += " AND a.price <= %s"
            params.append(max_price)
            
        query += """
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img, l.latitude, l.longitude
        ORDER BY max_price DESC
        LIMIT %s;
        """
        params.append(limit)
        
        raw_result = execute_query(query, tuple(params))
        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "max_price", "latitude", "longitude"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctors by price")


@router_show_doctors.get("/doctors_by_location")
async def get_doctors_by_location(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude coordinate"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude coordinate"),
    radius_km: Optional[float] = Query(default=10.0, ge=0.1, le=100.0, description="Search radius in kilometers"),
    limit: Optional[int] = Query(default=50, ge=1, le=100, description="Maximum number of doctors to return")
) -> list:
    """Get doctors within a specified radius from given coordinates."""
    try:
        # Haversine formula to calculate distance
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
        
        raw_result = execute_query(query, (latitude, longitude, latitude, radius_km, limit))
        
        columns = ["id", "name", "surname", "specialization", "rank", "profile_img", "latitude", "longitude", "address", "city", "distance_km"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctors by location")

@router_show_doctors.get("/patient_doctors")
async def get_patient_doctors(
    patient_id: int = Query(..., description="ID of the patient")
):
    """Endpoint to get doctors associated with a specific patient through appointments or medical records"""
    try:
        query = """
        SELECT DISTINCT 
            d.id,
            u.name,
            u.surname,
            d.specialization,
            u.email,
            GROUP_CONCAT(DISTINCT l.address) as locations
        FROM doctor d
        JOIN account u ON d.id = u.id
        LEFT JOIN location l ON l.doctor_id = d.id
        WHERE d.id IN (
            -- Dottori con cui il paziente ha avuto appuntamenti
            SELECT DISTINCT doctor_id 
            FROM appointment 
            WHERE patient_id = %s
            UNION
            -- Dottori che hanno cartelle cliniche del paziente
            SELECT DISTINCT doctor_id 
            FROM clinical_folder 
            WHERE patient_id = %s
        )
        GROUP BY d.id, u.name, u.surname, d.specialization, u.email
        ORDER BY u.name, u.surname;
        """

        raw_result = execute_query(query, (patient_id, patient_id))

        columns = ["id", "name", "surname", "specialization", "email", "locations"]
        result = []
        for row in raw_result:
            doctor = dict(zip(columns, row))
            # Converti la stringa delle locations in array
            doctor["locations"] = doctor["locations"].split(",") if doctor["locations"] else []
            result.append(doctor)
        
        return {"doctors": result}
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving patient doctors: {str(e)}")

