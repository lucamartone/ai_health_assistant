import mariadb

def connect_to_mariadb():
    """Stabilisce una connessione al database MariaDB."""
    conn = mariadb.connect(
        host="database",
        port=3306,
        user="user",
        password="userpwd",
        database="HealthDB"
    )
    print("Connesso a MariaDB")
    return conn

def execute_query(query: str, commit: bool = False):
    """Esegue una query al database."""
    conn = connect_to_mariadb()
    cursor: mariadb.Cursor = conn.cursor()
    cursor.execute(query)

    if commit:
        conn.commit()

    results = cursor.fetchall() if not commit else None
    cursor.close()
    conn.close()
    
    return results

def close_connection(conn):
    """Chiude la connessione al database."""
    if conn:
        conn.close()
        print("Connessione a MariaDB chiusa")
    else:
        print("Nessuna connessione da chiudere")