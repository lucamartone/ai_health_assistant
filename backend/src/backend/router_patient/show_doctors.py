from fastapi import APIRouter, HTTPException
from typing import List
from backend.connection import execute_query

router_show_doctors = APIRouter()


    
@router_show_doctors.get("/free_doctors_by_specialization")
async def get_doctors_by_availability(specialization: str) :
    """Endpoint to get doctors who have at least one free appointment for a given specialization."""
    try:
        query = """
        SELECT DISTINCT 
            d.id AS doctor_id,
            u.name,
            u.surname,
            d.specialization,
            d.rank,
            u.profile_img
        FROM doctor d
        JOIN user u ON d.id_doctor = u.id
        JOIN appointment a ON a.id_doctor = d.id
        WHERE d.specialization = %s
          AND a.state = 'waiting'
        ORDER BY d.rank DESC;
        """
        raw_result = execute_query(query, (specialization,))

        columns = ["doctor_id", "name", "surname", "specialization", "rank", "profile_img"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result
    
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctor availability")
    
@router_show_doctors.get("/free_doctors_by_specialization_priceASC")
async def get_doctors_by_priceASC(specialization: str) -> List[dict]:
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
            MIN(a.price) AS min_price
        FROM doctor d
        JOIN user u ON d.id_doctor = u.id
        JOIN appointment a ON a.id_doctor = d.id
        WHERE d.specialization = %s
          AND a.state = 'waiting'
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img
        ORDER BY min_price ASC;
        """
        raw_result = execute_query(query, (specialization,))
        columns = ["doctor_id", "name", "surname", "specialization", "rank", "profile_img", "min_price"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctors by price")


@router_show_doctors.get("/free_doctors_by_specialization_priceDESC")
async def get_doctors_by_priceDESC (specialization: str) -> List[dict]:
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
            MAX(a.price) AS max_price
        FROM doctor d
        JOIN user u ON d.id_doctor = u.id
        JOIN appointment a ON a.id_doctor = d.id
        WHERE d.specialization = %s
          AND a.state = 'waiting'
        GROUP BY d.id, u.name, u.surname, d.specialization, d.rank, u.profile_img
        ORDER BY max_price DESC;
        """
        
        raw_result = execute_query(query, (specialization,))
        columns = ["doctor_id", "name", "surname", "specialization", "rank", "profile_img", "max_price"]
        result = [dict(zip(columns, row)) for row in raw_result]
        return result

    except Exception as e:
        raise HTTPException(status_code=400, detail="Error retrieving doctors by price")


@router_show_doctors.get("/doctors_by_location") #not implemented
async def get_doctors_by_location(latitude: float, longitude: float) -> list:
    """Endpoint to get doctors ordered by location."""
    # Implement logic to retrieve and order doctors by geolocation


    # This is a placeholder implementation
    if latitude and longitude:
        return [{"doctor_id": "1", "name": "Dr. Smith", "location": (latitude, longitude)}]
    else:
        raise HTTPException(status_code=400, detail="Invalid location data")

