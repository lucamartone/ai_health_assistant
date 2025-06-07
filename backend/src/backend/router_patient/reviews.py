from fastapi import APIRouter, HTTPException

router_reviews = APIRouter()

@router_reviews.get("/review_doctor")
async def review_doctor(doctor_id: str, patient_id: str, rating: int):
    """Endpoint to rate a doctor."""
    # Implement logic to save the rating for the doctor
    if doctor_id and patient_id and 1 <= rating <= 5:
        return {"message": "Doctor rated successfully", "doctor_id": doctor_id, "rating": rating}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")