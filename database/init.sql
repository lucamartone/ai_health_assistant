-- DB creation
CREATE DATABASE IF NOT EXISTS HealthDB;
USE HealthDB;

-- user creation with privilages
DROP USER IF EXISTS 'user'@'%';
CREATE USER 'user'@'%' IDENTIFIED BY 'userpwd';
GRANT ALL PRIVILEGES ON HealthDB.* TO 'user'@'%' IDENTIFIED BY 'userpwd';

FLUSH PRIVILEGES;


CREATE TABLE utente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    cognome VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    reset_token VARCHAR(255),
    token_expiration TIMESTAMP,
    saldo DECIMAL(10, 2) DEFAULT 0.00,
    sesso CHAR(1) CHECK (sesso IN ('M', 'F')),
    foto_profilo BLOB
);

CREATE TABLE paziente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paziente INT NOT NULL,
    data_nascita DATE NOT NULL,
    FOREIGN KEY (id_paziente) REFERENCES utente(id)
);

CREATE TABLE medico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    specializzazione VARCHAR(50) NOT NULL,
    rank INT NOT NULL,
    id_medico INT NOT NULL,
    FOREIGN KEY (id_medico) REFERENCES utente(id)
);

CREATE TABLE appuntamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_medico INT NOT NULL,
    id_utente INT NOT NULL,
    data_ora TIMESTAMP NOT NULL,
    stato VARCHAR(20) DEFAULT 'in attesa',
    FOREIGN KEY (id_medico) REFERENCES medico(id),
    FOREIGN KEY (id_utente) REFERENCES utente(id)
);

CREATE TABLE cronologia (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_paziente INT NOT NULL,
    id_appuntamento INT NOT NULL,
    resoconto TEXT,
    valutazione INT CHECK (valutazione BETWEEN 1 AND 5),
    FOREIGN KEY (id_paziente) REFERENCES paziente(id),
    FOREIGN KEY (id_appuntamento) REFERENCES appuntamento(id)
);

