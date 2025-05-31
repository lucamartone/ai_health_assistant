frontend:
    src:
        frontend (server fast api)
            endpoint LLM
            endpoint profilo
                endpoint generic user
                endpoint paziente
                endpoint dottore
            endpoint database
            frontend.py
    public
        HTML
        CSS
        JS
    dockerfile
backend:
    src:
        backend(server fast api):
            endpoint LLM
            endpoint profilo
                endpoint generic user
                endpoint paziente
                endpoint dottore
            endpoint database
            backend.py
    dockerfile
database:
    init.sql
LLM:
    dockerfile
docker-compose

