-- Dati di test semplici per la health assistant

-- Account (con ID esplicito)
INSERT INTO account (id, name, surname, email, password, sex, birth_date) VALUES
(10, 'Dottore', 'Test', 'dottore@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'M', '1980-01-01'),
(20, 'Paziente', 'Test', 'paziente@test.com', '$2b$12$wk6BXhTQuTfwNAoT4ofAO.eIdt0tTke6R3/xcpnVX.X/2DWgogvXW', 'F', '1990-01-01')
ON CONFLICT (email) DO NOTHING;

-- Dottore e paziente
INSERT INTO doctor (id, specialization, rank) VALUES (10, 'Medicina Generale', 1.0) ON CONFLICT (id) DO NOTHING;
INSERT INTO patient (id) VALUES (20) ON CONFLICT (id) DO NOTHING;

-- Location (ID forzato a 1)
INSERT INTO location (id, doctor_id, address, city, province, latitude, longitude) VALUES
(1, 10, 'Via Test 1', 'TestCity', 'TC', 45.0, 9.0)
ON CONFLICT (id) DO NOTHING;

-- Appuntamento (ID forzato a 1)
INSERT INTO appointment (id, doctor_id, patient_id, location_id, date_time, status) VALUES
(1, 10, 20, 1, NOW() + INTERVAL '7 days', 'booked')
ON CONFLICT (id) DO NOTHING;

-- Cartella clinica
INSERT INTO clinical_folder (id, patient_id) VALUES (1, 20) ON CONFLICT (id) DO NOTHING;

-- Record medico
INSERT INTO medical_record (clinical_folder_id, doctor_id, appointment_id, symptoms, diagnosis, treatment_plan, notes) VALUES
(1, 10, 1, 'Mal di testa', 'Cefalea', 'Paracetamolo', 'Nessuna nota')
ON CONFLICT DO NOTHING; 