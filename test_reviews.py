#!/usr/bin/env python3
"""
Test script for the review system
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_review_system():
    """Test the review system endpoints"""
    
    print("🧪 Testing Review System")
    print("=" * 50)
    
    # Test 1: Get appointments to rank for patient 20
    print("\n1️⃣ Testing Get Appointments to Rank:")
    response = requests.get(f"{BASE_URL}/patient/reviews/appointments_to_rank?patient_id=20")
    if response.status_code == 200:
        data = response.json()
        appointments = data.get('appointments', [])
        print(f"✅ Found {len(appointments)} appointments to review")
        for i, apt in enumerate(appointments[:3], 1):
            print(f"   {i}. Dr. {apt['doctor_name']} {apt['doctor_surname']} - {apt['specialization']}")
            print(f"      Date: {apt['date_time']}, Price: {apt['price']}€")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 2: Submit a review for appointment 4 (which should not have a review yet)
    print("\n2️⃣ Testing Submit Review:")
    review_data = {
        "appointment_id": 4,
        "stars": 5,
        "report": "Ottimo dottore, molto professionale e competente!"
    }
    response = requests.post(f"{BASE_URL}/patient/reviews/review_appointment", json=review_data)
    if response.status_code == 200:
        print("✅ Review submitted successfully!")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 3: Check appointments again (should have one less)
    print("\n3️⃣ Testing Appointments After Review:")
    response = requests.get(f"{BASE_URL}/patient/reviews/appointments_to_rank?patient_id=20")
    if response.status_code == 200:
        data = response.json()
        appointments = data.get('appointments', [])
        print(f"✅ Found {len(appointments)} appointments to review (after submitting review)")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    try:
        test_review_system()
        print("\n🎉 All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the server. Make sure the backend is running on http://localhost:8001")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
