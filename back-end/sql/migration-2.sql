CREATE PROCEDURE addUser(new_email VARCHAR(255),new_password VARCHAR(255),new_type VARCHAR(255),new_active TINYINT,p_image_path VARCHAR(255))
BEGIN INSERT INTO users (email, password, type, active,image_path)
VALUES (new_email, new_password, new_type, new_active,p_image_path); END;