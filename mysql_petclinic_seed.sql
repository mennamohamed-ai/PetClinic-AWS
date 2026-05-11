        -- PetClinic full schema + seed data
        -- Source of structure: pet_clinic_system_design.html
        -- Compatible with MySQL 8+

        SET NAMES utf8mb4;
        SET FOREIGN_KEY_CHECKS = 0;

        DROP DATABASE IF EXISTS petclinic_auth_db;
        DROP DATABASE IF EXISTS petclinic_pet_db;
        DROP DATABASE IF EXISTS petclinic_vet_db;
        DROP DATABASE IF EXISTS petclinic_appt_db;
        DROP DATABASE IF EXISTS petclinic_medical_db;

        CREATE DATABASE petclinic_auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE DATABASE petclinic_pet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE DATABASE petclinic_vet_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE DATABASE petclinic_appt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE DATABASE petclinic_medical_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

        -- =========================
        -- auth-service database
        -- =========================
        USE petclinic_auth_db;
        CREATE TABLE users (
                               id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                               name VARCHAR(120) NOT NULL,
                               email VARCHAR(180) NOT NULL,
                               phone VARCHAR(20),
                               password VARCHAR(255) NOT NULL,
                               role ENUM('ADMIN','VET','PET_OWNER','RECEPTIONIST') NOT NULL,
                               is_active BOOLEAN NOT NULL DEFAULT TRUE,
                               created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (id),
                               UNIQUE KEY uq_users_email (email),
                               KEY idx_users_role (role)
        ) ENGINE=InnoDB;

        INSERT INTO users
        (id, name, email, password, phone, role, is_active, created_at)
        VALUES
            (1,  'System Admin',      'admin@petclinic.com',      'hashed_admin_001',     '+201000000001', 'ADMIN',        1, '2026-01-01 09:00:00'),
            (2,  'Mona Reception',    'reception@petclinic.com',  'hashed_reception_001',  '+201000000002', 'RECEPTIONIST', 1, '2026-01-01 09:10:00'),
            (3,  'Dr Mariam Samy',    'mariam@petclinic.com',     'hashed_vet_001',        '+201000000003', 'VET',          1, '2026-01-01 09:20:00'),
            (4,  'Dr Ahmed Farouk',   'ahmed@petclinic.com',      'hashed_vet_002',        '+201000000004', 'VET',          1, '2026-01-01 09:25:00'),
            (5,  'Dr Salma Adel',     'salma@petclinic.com',      'hashed_vet_003',        '+201000000005', 'VET',          1, '2026-01-01 09:30:00'),
            (6,  'Karim Omar',        'karim.owner@mail.com',     'hashed_owner_001',      '+201000000006', 'PET_OWNER',    1, '2026-01-02 10:00:00'),
            (7,  'Nour Hassan',       'nour.owner@mail.com',      'hashed_owner_002',      '+201000000007', 'PET_OWNER',    1, '2026-01-02 10:05:00'),
            (8,  'Youssef Adel',      'youssef.owner@mail.com',   'hashed_owner_003',      '+201000000008', 'PET_OWNER',    1, '2026-01-02 10:10:00'),
            (9,  'Salma Ibrahim',     'salma.owner@mail.com',     'hashed_owner_004',      '+201000000009', 'PET_OWNER',    1, '2026-01-02 10:15:00'),
            (10, 'Maged Fathy',       'maged.owner@mail.com',     'hashed_owner_005',      '+201000000010', 'PET_OWNER',    1, '2026-01-02 10:20:00'),
            (11, 'Heba Mostafa',      'heba.owner@mail.com',      'hashed_owner_006',      '+201000000011', 'PET_OWNER',    1, '2026-01-02 10:25:00'),
            (12, 'Ali Mahmoud',       'ali.owner@mail.com',       'hashed_owner_007',      '+201000000012', 'PET_OWNER',    1, '2026-01-02 10:30:00'),
            (13, 'Dr Hany Mostafa',   'hany@petclinic.com',       'hashed_vet_004',        '+201000000013', 'VET',          1, '2026-01-01 09:35:00'),
            (14, 'Dr Reem Nabil',     'reem@petclinic.com',       'hashed_vet_005',        '+201000000014', 'VET',          1, '2026-01-01 09:40:00'),
            (15, 'Dr Tarek Saad',     'tarek@petclinic.com',      'hashed_vet_006',        '+201000000015', 'VET',          1, '2026-01-01 09:45:00');
        -- =========================
        -- pet-service database
        -- =========================
        USE petclinic_pet_db;

        CREATE TABLE owners (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            phone VARCHAR(25) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(80) NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY uq_owners_user_id (user_id),
            KEY idx_owners_city (city)
        ) ENGINE=InnoDB;

        CREATE TABLE pets (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            owner_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(100) NOT NULL,
            type ENUM('DOG','CAT','BIRD','RABBIT') NOT NULL,
            breed VARCHAR(100) NOT NULL,
            birth_date DATE NOT NULL,
            gender ENUM('MALE','FEMALE') NOT NULL,
            weight DECIMAL(5,2) NOT NULL,
            PRIMARY KEY (id),
            KEY idx_pets_owner_id (owner_id),
            KEY idx_pets_type (type),
            CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES owners(id)
                ON UPDATE CASCADE ON DELETE CASCADE
        ) ENGINE=InnoDB;

        INSERT INTO owners (id, user_id, phone, address, city) VALUES
        (1,  6,  '+201000000601', 'Nasr City, Abbas El Akkad',       'Cairo'),
        (2,  7,  '+201000000602', 'Dokki, Tahrir Street',            'Giza'),
        (3,  8,  '+201000000603', 'Smouha, Victor Emanuel',          'Alexandria'),
        (4,  9,  '+201000000604', 'Maadi, Road 9',                   'Cairo'),
        (5,  10, '+201000000605', 'Mohandessin, Syria Street',       'Giza'),
        (6,  11, '+201000000606', 'Sidi Gaber, Khaled Ibn El Waleed','Alexandria'),
        (7,  12, '+201000000607', 'Heliopolis, El Merghany',         'Cairo');

        INSERT INTO pets (id, owner_id, name, type, breed, birth_date, gender, weight) VALUES
        (1,  1, 'Luna',    'CAT',    'Persian',        '2022-03-12', 'FEMALE', 4.20),
        (2,  1, 'Max',     'DOG',    'Golden Retriever','2021-08-25', 'MALE',   27.50),
        (3,  2, 'Milo',    'CAT',    'Siamese',        '2023-01-03', 'MALE',   3.70),
        (4,  2, 'Bella',   'RABBIT', 'Mini Lop',       '2024-02-18', 'FEMALE', 1.90),
        (5,  3, 'Coco',    'BIRD',   'Cockatiel',      '2022-11-11', 'FEMALE', 0.11),
        (6,  3, 'Rocky',   'DOG',    'German Shepherd','2020-04-05', 'MALE',   32.40),
        (7,  4, 'Nemo',    'CAT',    'Maine Coon',     '2021-06-09', 'MALE',   6.10),
        (8,  4, 'Ruby',    'DOG',    'Pug',            '2023-09-20', 'FEMALE', 8.60),
        (9,  5, 'Kiwi',    'BIRD',   'Budgerigar',     '2024-01-15', 'MALE',   0.04),
        (10, 5, 'Daisy',   'RABBIT', 'Dutch Rabbit',   '2022-07-27', 'FEMALE', 2.30),
        (11, 6, 'Simba',   'CAT',    'British Shorthair','2019-12-30','MALE',  5.40),
        (12, 6, 'Charlie', 'DOG',    'Beagle',         '2020-10-10', 'MALE',   12.80),
        (13, 7, 'Fluffy',  'RABBIT', 'Angora',         '2023-03-05', 'FEMALE', 2.00),
        (14, 7, 'Sky',     'BIRD',   'Canary',         '2021-05-22', 'FEMALE', 0.03);

        -- =========================
        -- vet-service database
        -- =========================
        USE petclinic_vet_db;

        CREATE TABLE vets (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id BIGINT UNSIGNED NOT NULL,
            name VARCHAR(120) NOT NULL,
            phone VARCHAR(25) NOT NULL,
            city VARCHAR(80) NOT NULL,
            address VARCHAR(255) NOT NULL,
            specialization VARCHAR(120) NOT NULL,
            animal_type ENUM('DOG','CAT','BIRD','RABBIT') NOT NULL,
            consultation_fee DECIMAL(10,2) NOT NULL,
            rating DECIMAL(3,2) NOT NULL,
            experience_years INT NOT NULL,
            available_days VARCHAR(100) NOT NULL,
            bio TEXT,
            is_available BOOLEAN NOT NULL DEFAULT TRUE,
            PRIMARY KEY (id),
            UNIQUE KEY uq_vets_user_id (user_id),
            KEY idx_vets_city (city),
            KEY idx_vets_consultation_fee (consultation_fee),
            KEY idx_vets_available (is_available)
        ) ENGINE=InnoDB;

        CREATE TABLE vet_specializations (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            vet_id BIGINT UNSIGNED NOT NULL,
            animal_type ENUM('DOG','CAT','BIRD','RABBIT') NOT NULL,
            PRIMARY KEY (id),
            KEY idx_vet_specializations_vet_id (vet_id),
            KEY idx_vet_specializations_animal_type (animal_type),
            CONSTRAINT fk_vet_specializations_vet FOREIGN KEY (vet_id) REFERENCES vets(id)
                ON UPDATE CASCADE ON DELETE CASCADE
        ) ENGINE=InnoDB;

        INSERT INTO vets
        (id, user_id, name, phone, city, address, specialization, animal_type, consultation_fee, rating, experience_years, available_days, bio, is_available) VALUES
        (1, 3, 'Dr Mariam Samy',  '+201100000001', 'Cairo',      'Nasr City, Makram Ebeid',       'Small Animals',   'CAT',    250.00, 4.80,  8, 'SUN,TUE,THU', 'Cat and small pet specialist.', 1),
        (2, 4, 'Dr Ahmed Farouk', '+201100000002', 'Giza',       'Dokki, Mosadak Street',          'General Vet',     'DOG',    180.00, 4.50,  6, 'SAT,MON,WED', 'General diagnostics and treatment.', 1),
        (3, 5, 'Dr Salma Adel',   '+201100000003', 'Alexandria', 'Smouha, Fawzy Moaz',             'Exotic Pets',     'BIRD',   320.00, 4.90, 11, 'SUN,MON,THU', 'Birds and rabbits care expert.', 0),
        (4, 13,'Dr Hany Mostafa', '+201100000004', 'Cairo',      'Maadi, Laselky',                 'Canine Surgery',  'DOG',    400.00, 4.70, 13, 'MON,TUE,FRI', 'Soft tissue surgery for dogs.', 1),
        (5, 14,'Dr Reem Nabil',   '+201100000005', 'Giza',       'Mohandessin, Gameat El Dowal',   'Feline Medicine', 'CAT',    220.00, 4.60,  7, 'SUN,WED,THU', 'Focused on feline internal medicine.', 1),
        (6, 15,'Dr Tarek Saad',   '+201100000006', 'Alexandria', 'Gleem, Abu Qir Street',          'Avian Medicine',  'BIRD',   280.00, 4.40,  9, 'SAT,MON,THU', 'Avian diagnostics and vaccination.', 1);

        INSERT INTO vet_specializations (vet_id, animal_type) VALUES
        (1, 'CAT'), (1, 'DOG'),
        (2, 'DOG'), (2, 'CAT'), (2, 'RABBIT'),
        (3, 'BIRD'), (3, 'RABBIT'),
        (4, 'DOG'),
        (5, 'CAT'),
        (6, 'BIRD');

        -- =========================
        -- appointment-service database
        -- =========================
        USE petclinic_appt_db;

        CREATE TABLE appointments (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            owner_id BIGINT UNSIGNED NOT NULL,
            pet_id BIGINT UNSIGNED NOT NULL,
            vet_id BIGINT UNSIGNED NOT NULL,
            appointment_date DATE NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            status ENUM('PENDING','CONFIRMED','DONE','CANCELLED') NOT NULL DEFAULT 'PENDING',
            reason TEXT NOT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_appt_owner_id (owner_id),
            KEY idx_appt_pet_id (pet_id),
            KEY idx_appt_vet_id (vet_id),
            KEY idx_appt_date (appointment_date),
            KEY idx_appt_status (status),
            CONSTRAINT chk_appt_time CHECK (start_time < end_time)
        ) ENGINE=InnoDB;

        INSERT INTO appointments
        (id, owner_id, pet_id, vet_id, appointment_date, start_time, end_time, status, reason, created_at) VALUES
        (1, 1, 1, 1, '2026-04-20', '10:00:00', '10:30:00', 'CONFIRMED', 'Skin allergy follow-up',         '2026-04-10 09:00:00'),
        (2, 1, 2, 2, '2026-04-20', '11:00:00', '11:30:00', 'PENDING',   'Annual check-up',                  '2026-04-10 09:30:00'),
        (3, 2, 3, 5, '2026-04-21', '12:00:00', '12:30:00', 'CONFIRMED', 'Loss of appetite',                 '2026-04-10 10:00:00'),
        (4, 2, 4, 3, '2026-04-21', '13:00:00', '13:30:00', 'PENDING',   'Rabbit vaccination',               '2026-04-10 10:15:00'),
        (5, 3, 5, 6, '2026-04-22', '09:00:00', '09:30:00', 'DONE',      'Wing injury treatment',            '2026-04-10 10:30:00'),
        (6, 3, 6, 4, '2026-04-22', '14:00:00', '14:45:00', 'CONFIRMED', 'Knee pain and mobility issue',     '2026-04-10 11:00:00'),
        (7, 4, 7, 1, '2026-04-23', '15:00:00', '15:30:00', 'CANCELLED', 'Routine grooming consultation',    '2026-04-10 11:30:00'),
        (8, 4, 8, 2, '2026-04-23', '16:00:00', '16:30:00', 'PENDING',   'Vaccination schedule',             '2026-04-10 12:00:00'),
        (9, 5, 9, 6, '2026-04-24', '10:00:00', '10:20:00', 'CONFIRMED', 'General avian examination',        '2026-04-10 12:20:00'),
        (10,5,10,3, '2026-04-24', '11:00:00', '11:30:00', 'PENDING',    'Digestive issue in rabbit',        '2026-04-10 12:40:00'),
        (11,6,11,5, '2026-04-25', '12:00:00', '12:30:00', 'DONE',       'Dental check and cleaning',        '2026-04-10 13:00:00'),
        (12,6,12,2, '2026-04-25', '13:00:00', '13:45:00', 'CONFIRMED',  'Ear infection symptoms',           '2026-04-10 13:20:00'),
        (13,7,13,3, '2026-04-26', '14:00:00', '14:30:00', 'PENDING',    'Hair loss and skin irritation',    '2026-04-10 13:40:00'),
        (14,7,14,6, '2026-04-26', '15:00:00', '15:20:00', 'CONFIRMED',  'Periodic bird health check',       '2026-04-10 14:00:00');

        -- =========================
        -- medical-service database
        -- =========================
        USE petclinic_medical_db;

        CREATE TABLE medical_records (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            appointment_id BIGINT UNSIGNED NOT NULL,
            pet_id BIGINT UNSIGNED NOT NULL,
            vet_id BIGINT UNSIGNED NOT NULL,
            diagnosis TEXT NOT NULL,
            prescription TEXT NOT NULL,
            notes TEXT,
            record_date DATE NOT NULL,
            follow_up_date DATE,
            PRIMARY KEY (id),
            KEY idx_medical_records_appointment_id (appointment_id),
            KEY idx_medical_records_pet_id (pet_id),
            KEY idx_medical_records_vet_id (vet_id)
        ) ENGINE=InnoDB;

        CREATE TABLE vaccinations (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            pet_id BIGINT UNSIGNED NOT NULL,
            record_id BIGINT UNSIGNED NOT NULL,
            vaccine_name VARCHAR(120) NOT NULL,
            date_given DATE NOT NULL,
            next_due DATE,
            PRIMARY KEY (id),
            KEY idx_vaccinations_pet_id (pet_id),
            KEY idx_vaccinations_record_id (record_id),
            CONSTRAINT fk_vaccinations_record FOREIGN KEY (record_id) REFERENCES medical_records(id)
                ON UPDATE CASCADE ON DELETE CASCADE
        ) ENGINE=InnoDB;

        CREATE TABLE invoices (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            appointment_id BIGINT UNSIGNED NOT NULL,
            owner_id BIGINT UNSIGNED NOT NULL,
            amount DECIMAL(10,2) NOT NULL,
            status ENUM('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
            issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            paid_at DATETIME NULL,
            PRIMARY KEY (id),
            KEY idx_invoices_appointment_id (appointment_id),
            KEY idx_invoices_owner_id (owner_id),
            KEY idx_invoices_status (status)
        ) ENGINE=InnoDB;

        INSERT INTO medical_records
        (id, appointment_id, pet_id, vet_id, diagnosis, prescription, notes, record_date, follow_up_date) VALUES
        (1, 1, 1, 1, 'Mild dermatitis',              'Topical cream twice daily for 7 days',   'Avoid harsh shampoo',                  '2026-04-20', '2026-04-27'),
        (2, 5, 5, 6, 'Minor wing sprain',            'Anti-inflammatory drops for 5 days',      'Limit flight activity',                '2026-04-22', '2026-04-29'),
        (3, 11,11,5, 'Tartar accumulation',          'Dental gel and chew treats',              'Schedule dental scaling in 3 months', '2026-04-25', '2026-07-25'),
        (4, 12,12,2, 'Otitis externa',               'Ear drops every 12 hours for 10 days',    'Keep ears dry',                        '2026-04-25', '2026-05-02'),
        (5, 9, 9, 6, 'Nutritional deficiency (bird)','Vitamin supplement in drinking water',     'Increase leafy greens',                '2026-04-24', '2026-05-08');

        INSERT INTO vaccinations (pet_id, record_id, vaccine_name, date_given, next_due) VALUES
        (2, 1, 'Rabies',        '2026-04-20', '2027-04-20'),
        (4, 2, 'RHDV2',         '2026-04-22', '2027-04-22'),
        (8, 4, 'DHPPi',         '2026-04-25', '2027-04-25'),
        (12,4, 'Bordetella',    '2026-04-25', '2027-04-25'),
        (5, 5, 'Polyomavirus',  '2026-04-24', '2027-04-24');

        INSERT INTO invoices
        (id, appointment_id, owner_id, amount, status, issued_at, paid_at) VALUES
        (1, 1, 1, 250.00, 'PAID',   '2026-04-20 10:40:00', '2026-04-20 10:50:00'),
        (2, 2, 1, 180.00, 'UNPAID', '2026-04-20 11:35:00', NULL),
        (3, 5, 3, 280.00, 'PAID',   '2026-04-22 09:45:00', '2026-04-22 10:00:00'),
        (4, 6, 3, 400.00, 'UNPAID', '2026-04-22 14:55:00', NULL),
        (5, 8, 4, 180.00, 'UNPAID', '2026-04-23 16:35:00', NULL),
        (6, 11,6, 220.00, 'PAID',   '2026-04-25 12:40:00', '2026-04-25 12:55:00'),
        (7, 12,6, 180.00, 'UNPAID', '2026-04-25 13:55:00', NULL),
        (8, 14,7, 280.00, 'UNPAID', '2026-04-26 15:30:00', NULL);

        SET FOREIGN_KEY_CHECKS = 1;

        -- Quick sanity outputs
        SELECT 'petclinic_auth_db.users' AS table_name, COUNT(*) AS rows_count FROM petclinic_auth_db.users
        UNION ALL
        SELECT 'petclinic_pet_db.owners', COUNT(*) FROM petclinic_pet_db.owners
        UNION ALL
        SELECT 'petclinic_pet_db.pets', COUNT(*) FROM petclinic_pet_db.pets
        UNION ALL
        SELECT 'petclinic_vet_db.vets', COUNT(*) FROM petclinic_vet_db.vets
        UNION ALL
        SELECT 'petclinic_vet_db.vet_specializations', COUNT(*) FROM petclinic_vet_db.vet_specializations
        UNION ALL
        SELECT 'petclinic_appt_db.appointments', COUNT(*) FROM petclinic_appt_db.appointments
        UNION ALL
        SELECT 'petclinic_medical_db.medical_records', COUNT(*) FROM petclinic_medical_db.medical_records
        UNION ALL
        SELECT 'petclinic_medical_db.vaccinations', COUNT(*) FROM petclinic_medical_db.vaccinations
        UNION ALL
        SELECT 'petclinic_medical_db.invoices', COUNT(*) FROM petclinic_medical_db.invoices;
