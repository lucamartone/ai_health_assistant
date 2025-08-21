#!/usr/bin/env python3
"""
Script semplice per creare un account amministratore
"""

import psycopg2
from passlib.context import CryptContext

# Configurazione database
DB_CONFIG = {
    'host': 'localhost',
    'database': 'HealthDB',
    'user': 'user',
    'password': 'userpwd',
    'port': 5433
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    """Crea l'account amministratore nella tabella admin."""
    conn = None
    try:
        print("🔌 Connessione al database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        print("✅ Connessione riuscita!")
        
        # Verifica se la tabella admin esiste
        check_table = """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'admin'
        );
        """
        cursor.execute(check_table)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            print("❌ Tabella 'admin' non trovata!")
            print("   Esegui prima lo script database/init.sql")
            return
        
        # Verifica se l'admin esiste già
        check_admin = "SELECT id, name, email FROM admin WHERE email = 'admin@mediflow.com'"
        cursor.execute(check_admin)
        existing_admin = cursor.fetchone()
        
        if existing_admin:
            print(f"⚠️  Admin già esistente:")
            print(f"   ID: {existing_admin[0]}")
            print(f"   Nome: {existing_admin[1]}")
            print(f"   Email: {existing_admin[2]}")
            return
        
        # Password: admin123
        print("🔐 Generazione hash password...")
        hashed_password = pwd_context.hash("admin123")
        
        # Inserimento admin
        print("👤 Creazione admin...")
        insert_query = """
        INSERT INTO admin (name, surname, email, password, role)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        
        admin_data = (
            'Admin', 
            'Sistema', 
            'admin@mediflow.com', 
            hashed_password,
            'admin'
        )
        
        cursor.execute(insert_query, admin_data)
        admin_id = cursor.fetchone()[0]
        conn.commit()
        
        print("✅ Admin creato con successo!")
        print(f"   ID: {admin_id}")
        print(f"   Nome: Admin Sistema")
        print(f"   Email: admin@mediflow.com")
        print(f"   Ruolo: admin")
        print(f"\n🔑 Credenziali di accesso:")
        print(f"   Email: admin@mediflow.com")
        print(f"   Password: admin123")
        print(f"\n🌐 URL di accesso:")
        print(f"   http://localhost/admin/")
        
    except psycopg2.OperationalError as e:
        print(f"❌ Errore di connessione: {e}")
        print("   Verifica che il database sia in esecuzione")
    except Exception as e:
        print(f"❌ Errore: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            print("\n🔌 Connessione chiusa")

if __name__ == "__main__":
    print("🚀 Creazione Admin Semplice")
    print("=" * 40)
    create_admin()
    print("\n✨ Script completato!") 