-- Utente (opzionale, gestito esternamente)
CREATE ROLE "admin" WITH LOGIN PASSWORD 'userpwd';
GRANT ALL PRIVILEGES ON DATABASE "HealthDB" TO "admin";

-- Tables

CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    token_expiration TIMESTAMP,
    balance NUMERIC(10, 2) DEFAULT 0.00,
    sex CHAR(1),
    profile_img BYTEA,
    last_login_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (sex IN ('M', 'F'))
);

CREATE TABLE patient (
    id SERIAL PRIMARY KEY,
    id_patient INT NOT NULL REFERENCES account(id),
    birth_date DATE NOT NULL,
    CHECK (birth_date < CURRENT_DATE)
);

CREATE TABLE doctor (
    id SERIAL PRIMARY KEY,
    specialization VARCHAR(50) NOT NULL,
    rank REAL DEFAULT 0,
    id_doctor INT NOT NULL REFERENCES account(id),
    CHECK (rank BETWEEN 0 AND 1)
);

CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    id_doctor INT NOT NULL REFERENCES doctor(id),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100),
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    CHECK (latitude BETWEEN -90 AND 90),
    CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE appointment (
    id SERIAL PRIMARY KEY,
    id_doctor INT NOT NULL REFERENCES doctor(id),
    id_account INT REFERENCES account(id),
    id_loc INT REFERENCES location(id),
    date_time TIMESTAMP NOT NULL,
    price NUMERIC(10,2) DEFAULT 50,
    state VARCHAR(20) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (price >= 0),
    CHECK (state IN ('waiting', 'booked', 'completed', 'cancelled'))
);

CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    id_patient INT NOT NULL REFERENCES patient(id),
    id_appointment INT NOT NULL REFERENCES appointment(id),
    report TEXT,
    review INT,
    CHECK (review IS NULL OR (review BETWEEN 1 AND 5))
);

-- Trigger: email validation
CREATE OR REPLACE FUNCTION validate_email_format() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Formato email non valido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_email
BEFORE INSERT ON account
FOR EACH ROW EXECUTE FUNCTION validate_email_format();

-- Trigger: stato appuntamento
CREATE OR REPLACE FUNCTION check_appointment_state() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.state = 'completed' AND OLD.state != 'booked' THEN
        RAISE EXCEPTION 'Un appuntamento può essere completato solo se era prenotato';
    ELSIF NEW.state = 'cancelled' AND OLD.state = 'completed' THEN
        RAISE EXCEPTION 'Un appuntamento completato non può essere cancellato';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_appointment_state
BEFORE UPDATE ON appointment
FOR EACH ROW EXECUTE FUNCTION check_appointment_state();

-- Indici
DROP INDEX IF EXISTS idx_account_email;
CREATE INDEX idx_account_email ON account(email);

DROP INDEX IF EXISTS idx_account_login_attempts;
CREATE INDEX idx_account_login_attempts ON account(failed_attempts, last_login_attempt);

DROP INDEX IF EXISTS idx_appointment_doctor;
CREATE INDEX idx_appointment_doctor ON appointment(id_doctor);

DROP INDEX IF EXISTS idx_appointment_account;
CREATE INDEX idx_appointment_account ON appointment(id_account);

DROP INDEX IF EXISTS idx_appointment_state;
CREATE INDEX idx_appointment_state ON appointment(state);

DROP INDEX IF EXISTS idx_appointment_datetime;
CREATE INDEX idx_appointment_datetime ON appointment(date_time);

DROP INDEX IF EXISTS idx_doctor_specialization;
CREATE INDEX idx_doctor_specialization ON doctor(specialization);

DROP INDEX IF EXISTS idx_location_coordinates;
CREATE INDEX idx_location_coordinates ON location(latitude, longitude);

-- Trigger: aggiorna password_changed_at
CREATE OR REPLACE FUNCTION update_password_changed_at() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password IS DISTINCT FROM OLD.password THEN
        NEW.password_changed_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_password_changed_at ON account;
CREATE TRIGGER trg_update_password_changed_at
BEFORE UPDATE ON account
FOR EACH ROW
EXECUTE FUNCTION update_password_changed_at();

-- Trigger: validazione forza password
CREATE OR REPLACE FUNCTION validate_password_strength() RETURNS TRIGGER AS $$
BEGIN
    IF LENGTH(NEW.password) < 8 THEN
        RAISE EXCEPTION 'La password deve contenere almeno 8 caratteri';
    END IF;
    IF NEW.password !~ '[A-Z]' THEN
        RAISE EXCEPTION 'La password deve contenere almeno una lettera maiuscola';
    END IF;
    IF NEW.password !~ '[a-z]' THEN
        RAISE EXCEPTION 'La password deve contenere almeno una lettera minuscola';
    END IF;
    IF NEW.password !~ '[0-9]' THEN
        RAISE EXCEPTION 'La password deve contenere almeno un numero';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_password ON account;
CREATE TRIGGER trg_validate_password
BEFORE INSERT ON account
FOR EACH ROW
EXECUTE FUNCTION validate_password_strength();

-- Trigger: data futura per appuntamento
CREATE OR REPLACE FUNCTION check_future_appointment_date() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_time <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'La data dell''appuntamento deve essere nel futuro';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_valid_date_time ON appointment;
CREATE TRIGGER trg_check_valid_date_time
BEFORE INSERT ON appointment
FOR EACH ROW
EXECUTE FUNCTION check_future_appointment_date();


-- Dati iniziali

INSERT INTO account (name, surname, email, password, sex) VALUES
('Giulia', 'Verdi', 'giulia.verdi@medico.it', 'Psjdhfbsjdhfshdjfwd123', 'F'),
('Luca', 'Bianchi', 'luca.bianchi@medico.it', 'Psjdhfbsjdhfshdjfwd123', 'M'),
('Francesca', 'Neri', 'francesca.neri@medico.it', 'Psjdhfbsjdhfshdjfwd123', 'F'),
('Marco', 'Russo', 'marco.russo@medico.it', 'Psjdhfbsjdhfshdjfwd123', 'M'),
('Alessia', 'Rossi', 'alessia.rossi@paziente.it', 'Psjdhfbsjdhfshdjfwd123', 'F'),
('Paolo', 'Ferrari', 'paolo.ferrari@paziente.it', 'Psjdhfbsjdhfshdjfwd123', 'M');

INSERT INTO doctor (specialization, rank, id_doctor) VALUES
('Cardiologia', 0.5, 1),
('Dermatologia', 0.4, 2),
('Psichiatria', 0.3, 3),
('Ortopedia', 0.4, 4);

INSERT INTO patient (id_patient, birth_date) VALUES
(5, '1990-05-12'),
(6, '1985-09-30');

INSERT INTO location (id_doctor, address, city, province, latitude, longitude) VALUES
(1, 'Via Roma 1', 'Milano', 'MI', 45.4654, 9.1866),
(2, 'Via Torino 23', 'Torino', 'TO', 45.0703, 7.6869),
(3, 'Piazza Duomo', 'Firenze', 'FI', 43.7696, 11.2558),
(4, 'Via Napoli 45', 'Napoli', 'NA', 40.8518, 14.2681);

INSERT INTO appointment (id_doctor, id_account, id_loc, date_time, price, state) VALUES
(1, NULL, 1, '2025-06-30 10:00:00', 80.00, 'waiting'),
(1, NULL, 1, '2025-06-30 11:00:00', 85.00, 'waiting'),
(2, NULL, 2, '2025-06-30 14:30:00', 60.00, 'waiting'),
(2, NULL, 2, '2025-06-30 09:00:00', 65.00, 'waiting'),
(3, NULL, 3, '2025-06-30 15:00:00', 120.00, 'waiting'),
(3, NULL, 3, '2025-06-30 10:00:00', 110.00, 'waiting'),
(4, NULL, 4, '2025-06-30 08:00:00', 70.00, 'waiting'),
(4, NULL, 4, '2025-06-30 10:30:00', 75.00, 'waiting');
