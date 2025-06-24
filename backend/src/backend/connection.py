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
    return conn


def execute_query(query: str, params: tuple = (), commit: bool = False, conn=None):
    close_conn = False
    if conn is None:
        conn = connect_to_postgres()
        close_conn = True

    cursor = conn.cursor()
    try:
        cursor.execute(query, params)

        # Prova a fare fetch, anche se commit è True
        try:
            results = cursor.fetchall()
        except psycopg2.ProgrammingError:
            results = None

        if commit:
            conn.commit()

    except Exception as e:
        conn.rollback()
        raise e

    finally:
        cursor.close()
        if close_conn:
            conn.close()

    return results


