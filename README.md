frontend:
    src:
        frontend (server fast api)
    public
    dockerfile
backend:
    src:
        backend(server fast api):
            endpoint LLM
            endpoint user
            endpoint database
    dockerfile
database:
    init.sql
LLM:
    dockerfile
docker-compose

