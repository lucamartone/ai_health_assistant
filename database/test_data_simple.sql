-- Dati di test semplici per MediFlow

-- Account (con ID esplicito)
INSERT INTO account (name, surname, email, password, sex, birth_date, role, created_at) VALUES
('Dottore', 'Test', 'dottore@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'M', '1980-01-01', 'doctor', '2020-01-01'),
('Paziente', 'Test', 'paziente@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'F', '1990-01-01', 'patient', '2022-01-01'),
('Mario', 'Rossi', 'mario.rossi@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'M', '1975-05-15', 'doctor', '2018-03-10'),
('Anna', 'Bianchi', 'anna.bianchi@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'F', '1982-08-22', 'doctor', '2019-07-15'),
('Luca', 'Verdi', 'luca.verdi@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'M', '1988-12-03', 'doctor', '2021-01-20'),
('Sofia', 'Neri', 'sofia.neri@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'F', '1979-04-18', 'doctor', '2017-11-05'),
('Giulia', 'Martini', 'giulia.martini@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'F', '1995-06-12', 'patient', '2023-02-15'),
('Marco', 'Ferrari', 'marco.ferrari@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'M', '1987-09-25', 'patient', '2022-08-10')
ON CONFLICT (email) DO NOTHING;

-- Dottori con diverse specializzazioni e anni di esperienza
INSERT INTO doctor (id, specialization, rank) VALUES 
(10, 'Medicina Generale', 0.8),
(11, 'Cardiologia', 0.9),
(12, 'Dermatologia', 0.7),
(13, 'Pediatria', 0.6),
(14, 'Ortopedia', 0.85)
ON CONFLICT (id) DO NOTHING;

-- Pazienti
INSERT INTO patient (id) VALUES 
(20), (21), (22)
ON CONFLICT (id) DO NOTHING;

-- Locations diverse per i dottori
INSERT INTO location (doctor_id, address, city, province, latitude, longitude) VALUES
(10, 'Via Roma 123', 'Milano', 'MI', 45.4642, 9.1900),
(11, 'Corso Italia 45', 'Milano', 'MI', 45.4642, 9.1900),
(12, 'Via Torino 67', 'Roma', 'RM', 41.9028, 12.4964),
(13, 'Piazza Navona 89', 'Roma', 'RM', 41.8986, 12.4731),
(14, 'Via Garibaldi 12', 'Torino', 'TO', 45.0703, 7.6869)
ON CONFLICT (id) DO NOTHING;

-- Appuntamenti con diversi stati e prezzi (alcuni completati per le recensioni)
INSERT INTO appointment (doctor_id, patient_id, location_id, date_time, price, status) VALUES
(10, 20, 1, NOW() - INTERVAL '7 days', 50, 'completed'),
(11, 21, 2, NOW() - INTERVAL '3 days', 80, 'completed'),
(12, 22, 3, NOW() - INTERVAL '5 days', 60, 'completed'),
(4, 13, 20, 4, NOW() - INTERVAL '10 days', 45, 'completed'),
(5, 14, 21, 5, NOW() - INTERVAL '2 days', 70, 'completed'),
(6, 10, 22, 1, NOW() + INTERVAL '1 day', 50, 'waiting'),
(7, 11, 20, 2, NOW() + INTERVAL '4 days', 80, 'waiting'),
(8, 12, 21, 3, NOW() + INTERVAL '6 days', 60, 'waiting'),
(9, 13, 22, 4, NOW() + INTERVAL '8 days', 45, 'waiting'),
(10, 14, 20, 5, NOW() + INTERVAL '12 days', 70, 'waiting')
ON CONFLICT (id) DO NOTHING;

-- Reviews per testare il sistema di valutazioni (alcune già esistenti)
INSERT INTO review (appointment_id, report, stars) VALUES
(1, 'Ottimo dottore, molto professionale', 5),
(2, 'Visita approfondita e dettagliata', 4),
(3, 'Buona esperienza, consigliato', 4),
(4, 'Dottore competente e paziente', 5),
(5, 'Visita rapida ma efficace', 3)
ON CONFLICT DO NOTHING;

-- Cartelle cliniche
INSERT INTO clinical_folder (patient_id) VALUES 
(20), (21), (22)
ON CONFLICT (id) DO NOTHING;

-- Record medici
INSERT INTO medical_record (clinical_folder_id, doctor_id, appointment_id, symptoms, diagnosis, treatment_plan, notes) VALUES
(1, 10, 1, 'Mal di testa', 'Cefalea', 'Paracetamolo', 'Nessuna nota'),
(2, 11, 2, 'Dolore al petto', 'Controllo cardiologico', 'ECG e analisi', 'Monitoraggio continuo'),
(3, 12, 3, 'Eruzione cutanea', 'Dermatite', 'Cremma antistaminico', 'Evitare allergeni')
ON CONFLICT DO NOTHING;