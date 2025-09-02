"""
Modulo di gestione delle connessioni al database PostgreSQL.

Questo modulo fornisce tutte le funzionalità necessarie per:
- Stabilire connessioni al database PostgreSQL
- Eseguire query SQL con gestione automatica delle transazioni
- Gestire la chiusura automatica delle connessioni
- Supportare sia query di lettura che di scrittura
- Gestire rollback automatico in caso di errori

Il sistema è ottimizzato per l'uso con Docker Compose
e gestisce automaticamente la pulizia delle risorse.
"""

import psycopg2
from psycopg2.extensions import cursor as PgCursor

def connect_to_postgres():
    """
    Stabilisce una connessione al database PostgreSQL.
    
    Questa funzione crea una nuova connessione al database utilizzando
    i parametri di configurazione predefiniti per l'ambiente Docker.
    
    Returns:
        psycopg2.extensions.connection: Oggetto connessione al database PostgreSQL
        
    Note:
        I parametri di connessione sono configurati per funzionare
        con il servizio database definito nel docker-compose.yml.
        La connessione deve essere chiusa manualmente dopo l'uso
        o utilizzare execute_query che gestisce automaticamente la chiusura.
    """
    conn = psycopg2.connect(
        host="database",      # Nome del servizio nel docker-compose
        port=5432,            # Porta standard PostgreSQL
        user="user",          # Deve combaciare con POSTGRES_USER
        password="userpwd",   # Deve combaciare con POSTGRES_PASSWORD
        dbname="HealthDB"     # Deve combaciare con POSTGRES_DB
    )
    return conn


def execute_query(query: str, params: tuple = (), commit: bool = False, conn=None):
    """
    Esegue una query SQL sul database PostgreSQL.
    
    Questa funzione gestisce l'esecuzione completa di query SQL:
    - Gestisce automaticamente l'apertura e chiusura delle connessioni
    - Supporta sia query di lettura che di scrittura
    - Gestisce automaticamente le transazioni (commit/rollback)
    - Gestisce la pulizia delle risorse (cursor e connessioni)
    
    Args:
        query: Stringa SQL da eseguire
        params: Tupla con i parametri per la query (opzionale)
        commit: Se True, esegue commit della transazione
        conn: Connessione esistente da utilizzare (opzionale)
        
    Returns:
        list: Lista dei risultati per query SELECT, None per altre query
        
    Raises:
        Exception: Rilancia qualsiasi errore che si verifica durante l'esecuzione
        
    Note:
        Se non viene fornita una connessione, ne viene creata una nuova
        che viene automaticamente chiusa dopo l'esecuzione.
        Per query di scrittura (INSERT, UPDATE, DELETE), impostare commit=True.
        In caso di errore, viene eseguito automaticamente rollback.
    """
    # Flag per gestire la chiusura automatica della connessione
    close_conn = False
    
    # Se non viene fornita una connessione, ne crea una nuova
    if conn is None:
        conn = connect_to_postgres()
        close_conn = True

    # Creazione del cursor per eseguire la query
    cursor = conn.cursor()
    
    try:
        # Esecuzione della query con i parametri forniti
        cursor.execute(query, params)

        # Tentativo di recupero dei risultati (funziona solo per SELECT)
        # Se la query non restituisce risultati, psycopg2.ProgrammingError viene gestito
        try:
            results = cursor.fetchall()
        except psycopg2.ProgrammingError:
            # Query non restituisce risultati (INSERT, UPDATE, DELETE, etc.)
            results = None

        # Commit della transazione se richiesto
        if commit:
            conn.commit()

    except Exception as e:
        # Rollback automatico in caso di errore per mantenere la consistenza
        conn.rollback()
        raise e

    finally:
        # Pulizia delle risorse: chiusura del cursor
        cursor.close()
        
        # Chiusura della connessione se è stata creata da questa funzione
        if close_conn:
            conn.close()

    return results


