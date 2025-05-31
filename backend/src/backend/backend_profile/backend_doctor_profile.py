from fastapi import APIRouter, HTTPException

doctor_profile_router = APIRouter()

@doctor_profile_router.post("/set_id_card")
async def set_id_card(doctor_id: str, id_card_data: str):
    """Endpoint to set the ID card for a doctor."""
    # Implement logic to save the ID card data for the doctor


    if doctor_id and id_card_data:
        return {"message": "ID card set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@doctor_profile_router.post("/set_photo")
async def set_photo(doctor_id: str, photo_data: str):
    """Endpoint to set the photo for a doctor."""
    # Implement logic to save the photo data for the doctor


    if doctor_id and photo_data:
        return {"message": "Photo set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

@doctor_profile_router.post("/set_cv")
async def set_cv(doctor_id: str, cv_data: str):
    """Endpoint to set the CV for a doctor."""
    # Implement logic to save the CV data for the doctor


    if doctor_id and cv_data:
        return {"message": "CV set successfully"}
    else:
        raise HTTPException(status_code=400, detail="Invalid input")

