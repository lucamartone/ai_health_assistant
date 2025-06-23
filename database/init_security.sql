-- Aggiornamenti di sicurezza per il database esistente

-- Modifica della tabella user per supportare le nuove funzionalità di sicurezza
ALTER TABLE user
    ADD COLUMN last_login_attempt TIMESTAMP NULL,
    ADD COLUMN failed_attempts INT DEFAULT 0,
    ADD COLUMN password_changed_at TIMESTAMP NULL,
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD CONSTRAINT email_format CHECK (email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');

ALTER TABLE appointment
MODIFY COLUMN state VARCHAR(20) DEFAULT 'waiting';

ALTER TABLE appointment
ADD CONSTRAINT valid_state CHECK (state IN ('waiting', 'booked', 'completed', 'cancelled'));


-- Aggiornamento della tabella location per validazione coordinate
ALTER TABLE location
    ADD CONSTRAINT valid_latitude CHECK (latitude BETWEEN -90 AND 90),
    ADD CONSTRAINT valid_longitude CHECK (longitude BETWEEN -180 AND 180);

-- Creazione degli indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_user_login_attempts ON user(failed_attempts, last_login_attempt);
CREATE INDEX IF NOT EXISTS idx_appointment_doctor ON appointment(id_doctor);
CREATE INDEX IF NOT EXISTS idx_appointment_user ON appointment(id_user);
CREATE INDEX IF NOT EXISTS idx_appointment_state ON appointment(state);
CREATE INDEX IF NOT EXISTS idx_appointment_datetime ON appointment(date_time);
CREATE INDEX IF NOT EXISTS idx_doctor_specialization ON doctor(specialization);
CREATE INDEX IF NOT EXISTS idx_location_coordinates ON location(latitude, longitude);

-- Funzione per aggiornare il timestamp di modifica password
DELIMITER //
CREATE TRIGGER update_password_changed_at_trigger
BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
    IF NEW.password != OLD.password THEN
        SET NEW.password_changed_at = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;

-- Funzione per verificare la validità della password
DELIMITER //
CREATE TRIGGER validate_password_trigger
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF LENGTH(NEW.password) < 8 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La password deve contenere almeno 8 caratteri';
    END IF;
    IF NEW.password NOT REGEXP '[A-Z]' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La password deve contenere almeno una lettera maiuscola';
    END IF;
    IF NEW.password NOT REGEXP '[a-z]' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La password deve contenere almeno una lettera minuscola';
    END IF;
    IF NEW.password NOT REGEXP '[0-9]' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La password deve contenere almeno un numero';
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE TRIGGER check_valid_date_time
BEFORE INSERT ON appointment
FOR EACH ROW
BEGIN
    IF NEW.date_time <= CURRENT_TIMESTAMP THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = "La data dell'appuntamento deve essere nel futuro";
    END IF;
END //
DELIMITER ;
