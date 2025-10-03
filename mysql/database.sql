-- ----------------- CREATE DATABASE -----------------
CREATE DATABASE IF NOT EXISTS criminal_management;
USE criminal_management;

-- ============================================================
-- USERS (for signup/login)
-- ============================================================
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,   -- store hashed password
  role ENUM('admin','police') NOT NULL
);

-- ============================================================
-- POLICE OFFICERS (managed by admin)
-- ============================================================
CREATE TABLE police_officer (
  officer_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE,
  name VARCHAR(100) NOT NULL,
  rank_title VARCHAR(50),
  station VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- CRIMINALS
-- ============================================================
CREATE TABLE criminal (
  criminal_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  gender ENUM('Male','Female','Other'),
  address VARCHAR(255),
  status ENUM('Under Trial','Released','Convicted') DEFAULT 'Under Trial'
);

-- ============================================================
-- FIR / CASES (crime + punishment details included)
-- ============================================================
CREATE TABLE fir (
  fir_id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id INT,
  fir_date DATE NOT NULL,
  case_status ENUM('Open','In Court','Closed') DEFAULT 'Open',

  -- Crime details
  crime_type VARCHAR(100),
  crime_date DATE,
  crime_description TEXT,

  -- Punishment details
  verdict ENUM('Pending','Guilty','Not Guilty') DEFAULT 'Pending',
  punishment_type VARCHAR(100),
  punishment_duration_years INT,
  punishment_start_date DATE,

  FOREIGN KEY (officer_id) REFERENCES police_officer(officer_id) ON DELETE SET NULL
);

-- ============================================================
-- FIR-CRIMINAL LINK (many-to-many)
-- ============================================================
CREATE TABLE fir_criminal (
  fir_id INT NOT NULL,
  criminal_id INT NOT NULL,
  PRIMARY KEY (fir_id, criminal_id),
  FOREIGN KEY (fir_id) REFERENCES fir(fir_id) ON DELETE CASCADE,
  FOREIGN KEY (criminal_id) REFERENCES criminal(criminal_id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_case_status ON fir(case_status);
CREATE INDEX idx_verdict ON fir(verdict);
CREATE INDEX idx_criminal_status ON criminal(status);

-- ============================================================
-- TRIGGERS
-- ============================================================
DELIMITER //

-- 1. When verdict is updated to 'Guilty', mark all linked criminals as 'Convicted'
CREATE TRIGGER trg_update_criminal_status_after_guilty
AFTER UPDATE ON fir
FOR EACH ROW
BEGIN
  IF NEW.verdict = 'Guilty' AND OLD.verdict <> 'Guilty' THEN
    UPDATE criminal
    SET status = 'Convicted'
    WHERE criminal_id IN (
      SELECT fc.criminal_id FROM fir_criminal fc WHERE fc.fir_id = NEW.fir_id
    );
  END IF;
END;
//

-- 2. When verdict is updated to 'Not Guilty', mark all linked criminals as 'Released'
CREATE TRIGGER trg_update_criminal_status_after_not_guilty
AFTER UPDATE ON fir
FOR EACH ROW
BEGIN
  IF NEW.verdict = 'Not Guilty' AND OLD.verdict <> 'Not Guilty' THEN
    UPDATE criminal
    SET status = 'Released'
    WHERE criminal_id IN (
      SELECT fc.criminal_id FROM fir_criminal fc WHERE fc.fir_id = NEW.fir_id
    );
  END IF;
END;
//

-- 3. When a FIR is deleted, if criminals are no longer linked to ANY FIR, reset their status to 'Under Trial'
CREATE TRIGGER trg_reset_criminal_status_after_fir_delete
AFTER DELETE ON fir
FOR EACH ROW
BEGIN
  UPDATE criminal
  SET status = 'Under Trial'
  WHERE criminal_id IN (
    SELECT c.criminal_id
    FROM criminal c
    LEFT JOIN fir_criminal fc ON c.criminal_id = fc.criminal_id
    WHERE fc.fir_id IS NULL
  );
END;
//

-- 4. When case_status becomes 'Closed', automatically set verdict to 'Pending' if not set
CREATE TRIGGER trg_set_verdict_pending_on_close
BEFORE UPDATE ON fir
FOR EACH ROW
BEGIN
  IF NEW.case_status = 'Closed' AND NEW.verdict IS NULL THEN
    SET NEW.verdict = 'Pending';
  END IF;
END;
//

DELIMITER ;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================
DELIMITER //

-- 1. Get details of a criminal and all their FIRs
CREATE PROCEDURE get_criminal_details (IN p_criminal_id INT)
BEGIN
  SELECT 
    c.criminal_id,
    c.name AS criminal_name,
    c.age,
    c.gender,
    c.address,
    c.status AS criminal_status,
    f.fir_id,
    f.fir_date,
    f.crime_type,
    f.crime_date,
    f.crime_description,
    f.case_status,
    f.verdict,
    f.punishment_type,
    f.punishment_duration_years,
    f.punishment_start_date
  FROM criminal c
  LEFT JOIN fir_criminal fc ON c.criminal_id = fc.criminal_id
  LEFT JOIN fir f ON fc.fir_id = f.fir_id
  WHERE c.criminal_id = p_criminal_id;
END;
//

-- 2. Get details of a FIR and all linked criminals
CREATE PROCEDURE get_fir_details (IN p_fir_id INT)
BEGIN
  SELECT 
    f.fir_id,
    f.fir_date,
    f.crime_type,
    f.crime_date,
    f.crime_description,
    f.case_status,
    f.verdict,
    f.punishment_type,
    f.punishment_duration_years,
    f.punishment_start_date,
    c.criminal_id,
    c.name AS criminal_name,
    c.age,
    c.gender,
    c.address,
    c.status AS criminal_status
  FROM fir f
  LEFT JOIN fir_criminal fc ON f.fir_id = fc.fir_id
  LEFT JOIN criminal c ON fc.criminal_id = c.criminal_id
  WHERE f.fir_id = p_fir_id;
END;
//

-- 3. Register a new FIR with multiple criminals
CREATE PROCEDURE register_fir (
    IN p_officer_id INT,
    IN p_fir_date DATE,
    IN p_case_status VARCHAR(20),
    IN p_crime_type VARCHAR(100),
    IN p_crime_date DATE,
    IN p_crime_description TEXT,
    IN p_criminal_ids VARCHAR(255)   -- comma-separated IDs
)
BEGIN
  DECLARE v_fir_id INT;

  -- Insert into FIR
  INSERT INTO fir (officer_id, fir_date, case_status, crime_type, crime_date, crime_description)
  VALUES (p_officer_id, p_fir_date, p_case_status, p_crime_type, p_crime_date, p_crime_description);

  SET v_fir_id = LAST_INSERT_ID();

  -- Insert criminals linked to FIR
  WHILE LOCATE(',', p_criminal_ids) > 0 DO
    INSERT INTO fir_criminal (fir_id, criminal_id)
    VALUES (v_fir_id, CAST(SUBSTRING_INDEX(p_criminal_ids, ',', 1) AS UNSIGNED));
    SET p_criminal_ids = SUBSTRING(p_criminal_ids, LOCATE(',', p_criminal_ids) + 1);
  END WHILE;

  -- Insert last ID
  IF p_criminal_ids <> '' THEN
    INSERT INTO fir_criminal (fir_id, criminal_id)
    VALUES (v_fir_id, CAST(p_criminal_ids AS UNSIGNED));
  END IF;
END;
//

DELIMITER ;



COMMIT;