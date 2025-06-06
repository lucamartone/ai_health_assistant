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
    password VARCHAR(50) NOT NULL,
    reset_token VARCHAR(255),
    token_expiration TIMESTAMP,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    sex CHAR(1) CHECK (sex IN ('M', 'F')),
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

CREATE TABLE appointment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_doctor INT NOT NULL,
    id_user INT NOT NULL,
    date_time TIMESTAMP NOT NULL,
    state VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (id_doctor) REFERENCES doctor(id),
    FOREIGN KEY (id_user) REFERENCES user(id)
);

CREATE TABLE history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_patient INT NOT NULL,
    id_appointment INT NOT NULL,
    report TEXT,
    review INT CHECK (review BETWEEN 1 AND 5),
    FOREIGN KEY (id_patient) REFERENCES patient(id),
    FOREIGN KEY (id_appointment) REFERENCES appointment(id)
);

