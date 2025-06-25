-- Creazione ruolo e database
CREATE ROLE admin WITH LOGIN PASSWORD 'userpwd';
GRANT ALL PRIVILEGES ON DATABASE "HealthDB" TO admin;

-- Tabella account
CREATE TABLE account (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    sex CHAR(1) CHECK (sex IN ('M', 'F')),
    birth_date DATE CHECK (birth_date < CURRENT_DATE),
    profile_img BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failed_attempts INT DEFAULT 0,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella doctor (deriva da account)
CREATE TABLE doctor (
    id INT PRIMARY KEY REFERENCES account(id),
    specialization VARCHAR(50) NOT NULL,
    rank REAL DEFAULT 0 CHECK (rank BETWEEN 0 AND 1)
);

-- Tabella patient (deriva da account)
CREATE TABLE patient (
    id INT PRIMARY KEY REFERENCES account(id)
);

-- Tabella location
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctor(id),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100),
    latitude NUMERIC(10,8) CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(11,8) CHECK (longitude BETWEEN -180 AND 180)
);

-- Tabella appointment
CREATE TABLE appointment (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL REFERENCES doctor(id),
    patient_id INT REFERENCES patient(id),
    location_id INT NOT NULL REFERENCES location(id),
    date_time TIMESTAMP NOT NULL,
    price NUMERIC(10,2) DEFAULT 50 CHECK (price >= 0),
    state VARCHAR(20) DEFAULT 'waiting' CHECK (state IN ('waiting', 'booked', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella history
CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    patient_id INT NOT NULL REFERENCES patient(id),
    appointment_id INT NOT NULL REFERENCES appointment(id),
    report TEXT,
    review INT CHECK (review IS NULL OR (review BETWEEN 1 AND 5))
);

-- =========================================
-- TRIGGER: forza password forte su account
-- =========================================

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

CREATE TRIGGER trg_validate_password
BEFORE INSERT ON account
FOR EACH ROW
EXECUTE FUNCTION validate_password_strength();

-- =========================================
-- TRIGGER: aggiorna password_changed_at
-- =========================================

CREATE OR REPLACE FUNCTION update_password_changed_at() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password IS DISTINCT FROM OLD.password THEN
        NEW.password_changed_at := CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_password_changed_at
BEFORE UPDATE ON account
FOR EACH ROW
EXECUTE FUNCTION update_password_changed_at();

-- =========================================
-- TRIGGER: data appuntamento nel futuro
-- =========================================

CREATE OR REPLACE FUNCTION check_future_appointment_date() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_time <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'La data dell''appuntamento deve essere nel futuro';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_valid_date_time
BEFORE INSERT ON appointment
FOR EACH ROW
EXECUTE FUNCTION check_future_appointment_date();

-- =========================================
-- TRIGGER: stato valido appuntamento
-- =========================================

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
FOR EACH ROW
EXECUTE FUNCTION check_appointment_state();

-- =========================================
-- Indici utili
-- =========================================

CREATE INDEX idx_account_email ON account(email);
CREATE INDEX idx_account_login_attempts ON account(failed_attempts, last_login_attempt);
CREATE INDEX idx_doctor_specialization ON doctor(specialization);
CREATE INDEX idx_appointment_doctor ON appointment(doctor_id);
CREATE INDEX idx_appointment_patient ON appointment(patient_id);
CREATE INDEX idx_appointment_datetime ON appointment(date_time);
CREATE INDEX idx_appointment_state ON appointment(state);
CREATE INDEX idx_location_coordinates ON location(latitude, longitude);
