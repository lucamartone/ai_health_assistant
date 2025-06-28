#!/usr/bin/env python3
from passlib.context import CryptContext

# Configura il contesto di crittografia come nel backend
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password di test
password = "Test123!"

# Genera l'hash
hashed_password = pwd_context.hash(password)

print(f"Password: {password}")
print(f"Hash: {hashed_password}")

# Verifica che l'hash sia corretto
is_valid = pwd_context.verify(password, hashed_password)
print(f"Verifica: {is_valid}") 