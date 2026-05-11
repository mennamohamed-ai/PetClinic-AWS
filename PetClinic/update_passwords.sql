USE petclinic_auth_db;

-- تحديث كلمات المرور لجميع المستخدمين إلى PetDemo12!Aa
-- Hash: $2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2
-- Algorithm: BCrypt with strength=12 (2^12 iterations + auto-generated salt)

UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 1;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 2;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 3;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 4;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 5;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 6;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 7;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 8;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 9;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 10;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 11;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 12;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 13;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 14;
UPDATE users SET password = '$2b$12$CUcUXc1R6Vf8GYY4g7EAyuGMTPxJAozjrrkd4qZHhwpPU2GowYde2' WHERE id = 15;

-- Verify
SELECT id, email, role, LEFT(password,10) FROM users;