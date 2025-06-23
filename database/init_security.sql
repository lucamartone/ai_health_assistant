-- Creazione degli indici (senza IF NOT EXISTS)
DROP INDEX IF EXISTS idx_user_email ON user;
CREATE INDEX idx_user_email ON user(email);

DROP INDEX IF EXISTS idx_user_login_attempts ON user;
CREATE INDEX idx_user_login_attempts ON user(failed_attempts, last_login_attempt);

DROP INDEX IF EXISTS idx_appointment_doctor ON appointment;
CREATE INDEX idx_appointment_doctor ON appointment(id_doctor);

DROP INDEX IF EXISTS idx_appointment_user ON appointment;
CREATE INDEX idx_appointment_user ON appointment(id_user);

DROP INDEX IF EXISTS idx_appointment_state ON appointment;
CREATE INDEX idx_appointment_state ON appointment(state);

DROP INDEX IF EXISTS idx_appointment_datetime ON appointment;
CREATE INDEX idx_appointment_datetime ON appointment(date_time);

DROP INDEX IF EXISTS idx_doctor_specialization ON doctor;
CREATE INDEX idx_doctor_specialization ON doctor(specialization);

DROP INDEX IF EXISTS idx_location_coordinates ON location;
CREATE INDEX idx_location_coordinates ON location(latitude, longitude);

-- Trigger per aggiornare il timestamp della modifica password
DELIMITER //
CREATE TRIGGER update_password_changed_at_trigger
BEFORE UPDATE ON user
FOR EACH ROW
BEGIN
    IF NEW.password != OLD.password THEN
        SET NEW.password_changed_at = CURRENT_TIMESTAMP;
    END IF;
END;
//
DELIMITER ;

-- Trigger per validare la forza della password
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
END;
//
DELIMITER ;

-- Trigger per verificare che la data dell'appuntamento sia futura
DELIMITER //
CREATE TRIGGER check_valid_date_time
BEFORE INSERT ON appointment
FOR EACH ROW
BEGIN
    IF NEW.date_time <= CURRENT_TIMESTAMP THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La data dello appuntamento deve essere nel futuro';
    END IF;
END;
//
DELIMITER ;
