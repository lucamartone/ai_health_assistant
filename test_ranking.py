#!/usr/bin/env python3
"""
Test script for the doctor ranking system
"""

import requests
import json

BASE_URL = "http://localhost:8001"

def test_ranking_endpoint():
    """Test the ranking endpoint with different parameters"""
    
    print("🧪 Testing Doctor Ranking System")
    print("=" * 50)
    
    # Test 1: Comprehensive ranking
    print("\n1️⃣ Testing Comprehensive Ranking:")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?sort_by=comprehensive&limit=10")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} doctors")
        for i, doctor in enumerate(doctors[:3], 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - {doctor['specialization']}")
            print(f"      Rating: {doctor.get('avg_rating', 'N/A')}, Experience: {doctor.get('years_experience', 'N/A')} years")
            print(f"      Available slots: {doctor.get('available_slots', 'N/A')}, Price: {doctor.get('price', 'N/A')}€")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 2: Rating-based ranking
    print("\n2️⃣ Testing Rating-based Ranking:")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?sort_by=rating&limit=5")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} doctors")
        for i, doctor in enumerate(doctors[:3], 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - Rating: {doctor.get('avg_rating', 'N/A')}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 3: Experience-based ranking
    print("\n3️⃣ Testing Experience-based Ranking:")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?sort_by=experience&limit=5")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} doctors")
        for i, doctor in enumerate(doctors[:3], 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - Experience: {doctor.get('years_experience', 'N/A')} years")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 4: Price-based ranking
    print("\n4️⃣ Testing Price-based Ranking:")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?sort_by=price&limit=5")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} doctors")
        for i, doctor in enumerate(doctors[:3], 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - Price: {doctor.get('price', 'N/A')}€")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 5: Availability-based ranking
    print("\n5️⃣ Testing Availability-based Ranking:")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?sort_by=availability&limit=5")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} doctors")
        for i, doctor in enumerate(doctors[:3], 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - Available slots: {doctor.get('available_slots', 'N/A')}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 6: Filtered by specialization
    print("\n6️⃣ Testing Filtered by Specialization (Cardiologia):")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?specialization=Cardiologia&sort_by=comprehensive&limit=5")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} cardiologists")
        for i, doctor in enumerate(doctors, 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - {doctor['specialization']}")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")
    
    # Test 7: Distance-based ranking (with coordinates)
    print("\n7️⃣ Testing Distance-based Ranking (Milano coordinates):")
    response = requests.get(f"{BASE_URL}/patient/doctors/get_ranked_doctors?latitude=45.4642&longitude=9.1900&sort_by=distance&limit=5")
    if response.status_code == 200:
        doctors = response.json()
        print(f"✅ Found {len(doctors)} doctors")
        for i, doctor in enumerate(doctors[:3], 1):
            print(f"   {i}. {doctor['name']} {doctor['surname']} - Distance: {doctor.get('distance_km', 'N/A')} km")
    else:
        print(f"❌ Error: {response.status_code} - {response.text}")

if __name__ == "__main__":
    try:
        test_ranking_endpoint()
        print("\n🎉 All tests completed!")
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the server. Make sure the backend is running on http://localhost:8001")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
