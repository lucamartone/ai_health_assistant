-- DB creation
CREATE DATABASE IF NOT EXISTS HealthDB;
USE HealthDB;

-- user creation with privilages
DROP USER IF EXISTS 'user'@'%';
CREATE USER 'user'@'%' IDENTIFIED BY 'userpwd';
GRANT ALL PRIVILEGES ON HealthDB.* TO 'user'@'%' IDENTIFIED BY 'userpwd';

FLUSH PRIVILEGES;


CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    token_expiration TIMESTAMP,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    sex CHAR(1),
    profile_img BLOB
);

CREATE TABLE patient (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_patient INT NOT NULL,
    birth_date DATE NOT NULL,
    FOREIGN KEY (id_patient) REFERENCES user(id)
);

CREATE TABLE doctor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    specialization VARCHAR(50) NOT NULL,
    rank INT NOT NULL,
    id_doctor INT NOT NULL,
    FOREIGN KEY (id_doctor) REFERENCES user(id)
);

CREATE TABLE location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_doctor INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    province VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    FOREIGN KEY (id_doctor) REFERENCES doctor(id)
);

CREATE TABLE appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_doctor INT NOT NULL,
    id_user INT,
    id_loc INT,
    date_time TIMESTAMP NOT NULL,
    price DECIMAL(10,2) DEFAULT 50,
    state VARCHAR(20) DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_doctor) REFERENCES doctor(id),
    FOREIGN KEY (id_user) REFERENCES user(id),
    FOREIGN KEY (id_loc) REFERENCES location(id),
    CONSTRAINT valid_price CHECK (price >= 0),
    CONSTRAINT valid_state CHECK (state IN ('waiting', 'booked', 'completed', 'cancelled'))
);

-- Trigger per validare il sesso dell'utente
DELIMITER //
CREATE TRIGGER check_user_sex
BEFORE INSERT ON user
FOR EACH ROW
BEGIN
    IF NEW.sex NOT IN ('M', 'F') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il sesso deve essere M o F';
    END IF;
END;//
DELIMITER ;

-- Trigger per validare la data di nascita del paziente
DELIMITER //
CREATE TRIGGER check_patient_birth_date
BEFORE INSERT ON patient
FOR EACH ROW
BEGIN
    IF NEW.birth_date >= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La data di nascita deve essere nel passato';
    END IF;
END;//
DELIMITER ;

-- Trigger per validare il rank del dottore
DELIMITER //
CREATE TRIGGER check_doctor_rank
BEFORE INSERT ON doctor
FOR EACH ROW
BEGIN
    IF NEW.rank < 1 OR NEW.rank > 5 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Il rank del dottore deve essere tra 1 e 5';
    END IF;
END;//
DELIMITER ;

-- Trigger per validare la recensione nella storia
DELIMITER //
CREATE TRIGGER check_history_review
BEFORE INSERT ON history
FOR EACH ROW
BEGIN
    IF NEW.review IS NOT NULL AND (NEW.review < 1 OR NEW.review > 5) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La recensione deve essere un numero tra 1 e 5';
    END IF;
END;//
DELIMITER ;

-- Trigger per aggiornare lo stato dell'appuntamento
DELIMITER //
CREATE TRIGGER update_appointment_state
BEFORE UPDATE ON appointment
FOR EACH ROW
BEGIN
    IF NEW.state = 'completed' AND OLD.state != 'booked' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un appuntamento può essere completato solo se era prenotato';
    END IF;
    
    IF NEW.state = 'cancelled' AND OLD.state = 'completed' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Un appuntamento completato non può essere cancellato';
    END IF;
END;//
DELIMITER ;

CREATE TABLE history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_patient INT NOT NULL,
    id_appointment INT NOT NULL,
    report TEXT,
    review INT CHECK (review BETWEEN 1 AND 5),
    FOREIGN KEY (id_patient) REFERENCES patient(id),
    FOREIGN KEY (id_appointment) REFERENCES appointment(id)
);



-- DOTTORI
INSERT INTO user (name, surname, email, password, sex) VALUES
('Giulia', 'Verdi', 'giulia.verdi@medico.it', 'pwd123', 'F'),
('Luca', 'Bianchi', 'luca.bianchi@medico.it', 'pwd123', 'M'),
('Francesca', 'Neri', 'francesca.neri@medico.it', 'pwd123', 'F'),
('Marco', 'Russo', 'marco.russo@medico.it', 'pwd123', 'M');

-- PAZIENTI
INSERT INTO user (name, surname, email, password, sex) VALUES
('Alessia', 'Rossi', 'alessia.rossi@paziente.it', 'pwd123', 'F'),
('Paolo', 'Ferrari', 'paolo.ferrari@paziente.it', 'pwd123', 'M');

INSERT INTO doctor (specialization, rank, id_doctor) VALUES
('Cardiologia', 5, 1),
('Dermatologia', 4, 2),
('Psichiatria', 3, 3),
('Ortopedia', 4, 4);

INSERT INTO patient (id_patient, birth_date) VALUES
(5, '1990-05-12'),
(6, '1985-09-30');

-- LOCATION per ogni dottore
INSERT INTO location (id_doctor, address, city, province, latitude, longitude) VALUES
(1, 'Via Roma 1', 'Milano', 'MI', 45.4654, 9.1866),        -- Giulia Verdi
(2, 'Via Torino 23', 'Torino', 'TO', 45.0703, 7.6869),      -- Luca Bianchi
(3, 'Piazza Duomo', 'Firenze', 'FI', 43.7696, 11.2558),     -- Francesca Neri
(4, 'Via Napoli 45', 'Napoli', 'NA', 40.8518, 14.2681);     -- Marco Russo

-- Appuntamenti per la Cardiologa (Giulia Verdi, id_doctor=1, id_loc=1)
INSERT INTO appointment (id_doctor, id_user, id_loc, date_time, price, state) VALUES
(1, NULL, 1, '2025-06-10 10:00:00', 80.00, 'waiting'),
(1, NULL,    1, '2025-06-12 11:00:00', 85.00, 'waiting');

-- Dermatologo (Luca Bianchi, id_doctor=2, id_loc=2)
INSERT INTO appointment (id_doctor, id_user, id_loc, date_time, price, state) VALUES
(2, NULL, 2, '2025-06-11 14:30:00', 60.00, 'waiting'),
(2, NULL,    2, '2025-06-15 09:00:00', 65.00, 'waiting');

-- Psichiatra (Francesca Neri, id_doctor=3, id_loc=3)
INSERT INTO appointment (id_doctor, id_user, id_loc, date_time, price, state) VALUES
(3, NULL, 3, '2025-06-09 15:00:00', 120.00, 'waiting'),
(3, NULL, 3, '2025-06-13 10:00:00', 110.00, 'waiting');

-- Ortopedico (Marco Russo, id_doctor=4, id_loc=4)
INSERT INTO appointment (id_doctor, id_user, id_loc, date_time, price, state) VALUES
(4, NULL,    4, '2025-06-10 08:00:00', 70.00, 'waiting'),
(4, NULL, 4, '2025-06-14 10:30:00', 75.00, 'waiting');