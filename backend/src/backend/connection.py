import psycopg2
from psycopg2.extensions import cursor as PgCursor

def connect_to_postgres():
    """Stabilisce una connessione al database PostgreSQL."""
    conn = psycopg2.connect(
        host="database",      # nome del servizio nel docker-compose
        port=5432,
        user="user",          # deve combaciare con POSTGRES_USER
        password="userpwd",   # POSTGRES_PASSWORD
        dbname="HealthDB"     # POSTGRES_DB
    )
    print("Connesso a PostgreSQL")
    return conn


def execute_query(query: str, params: tuple = (), commit: bool = False):
    conn = connect_to_postgres()
    cursor: PgCursor = conn.cursor()
    
    try:
        cursor.execute(query, params)
        if commit:
            conn.commit()
            results = None
        else:
            results = cursor.fetchall()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

    return results

