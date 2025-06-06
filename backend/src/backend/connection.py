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

def execute_query(query: str, params: tuple = (), commit: bool = False):
    conn = connect_to_mariadb()
    cursor: mariadb.Cursor = conn.cursor()
    cursor.execute(query, params)

    if commit:
        conn.commit()

    results = cursor.fetchall() if not commit else None
    cursor.close()
    conn.close()
    
    return results
