-- CREATE DATABASE
CREATE DATABASE IF NOT EXISTS criminal_management;
USE criminal_management;

-- ----------------- USERS TABLE -----------------
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,   -- Store hashed passwords
  role ENUM('admin','police','court') NOT NULL
);

-- ----------------- POLICE OFFICER TABLE -----------------
CREATE TABLE police_officer (
  officer_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  rank_title VARCHAR(50),
  station VARCHAR(100)
);

-- ----------------- CRIMINAL TABLE -----------------
CREATE TABLE criminal (
  criminal_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  age INT,
  gender VARCHAR(10),
  address VARCHAR(255),
  status ENUM('Under Trial','Released','Convicted') DEFAULT 'Under Trial'
);

-- ----------------- CRIME TABLE -----------------
CREATE TABLE crime (
  crime_id INT AUTO_INCREMENT PRIMARY KEY,
  criminal_id INT,
  crime_type VARCHAR(50),
  crime_date DATE,
  description VARCHAR(255),
  FOREIGN KEY (criminal_id) REFERENCES criminal(criminal_id) ON DELETE CASCADE
);

-- ----------------- CASES TABLE -----------------
CREATE TABLE cases (
  case_id INT AUTO_INCREMENT PRIMARY KEY,
  criminal_id INT,
  officer_id INT,
  case_status ENUM('Open','In Court','Closed') DEFAULT 'Open',
  case_date DATE,
  FOREIGN KEY (criminal_id) REFERENCES criminal(criminal_id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES police_officer(officer_id) ON DELETE SET NULL
);

-- ----------------- COURT TABLE -----------------
CREATE TABLE court (
  court_id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT,
  hearing_date DATE,
  verdict ENUM('Guilty','Not Guilty','Pending') DEFAULT 'Pending',
  FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE CASCADE
);

-- ----------------- PUNISHMENT TABLE -----------------
CREATE TABLE punishment (
  punishment_id INT AUTO_INCREMENT PRIMARY KEY,
  court_id INT,
  punishment_type VARCHAR(50),
  duration VARCHAR(50),
  start_date DATE,
  FOREIGN KEY (court_id) REFERENCES court(court_id) ON DELETE CASCADE
);

-- ----------------- DUMMY DATA -----------------

-- Users (passwords here are plain text, hash them in backend)
INSERT INTO users (username, password, role)
VALUES 
('admin1', 'adminpass', 'admin'),
('police1', 'policepass', 'police'),
('court1', 'courtpass', 'court');

-- Police officers
INSERT INTO police_officer (name, rank_title, station)
VALUES
('Raj Kumar', 'Inspector', 'Central Station'),
('Aditya Rao', 'Sub-Inspector', 'City Station');

-- Criminals
INSERT INTO criminal (name, age, gender, address)
VALUES
('John Doe', 30, 'Male', 'Delhi'),
('Anita Sharma', 25, 'Female', 'Mumbai');

-- Crimes
INSERT INTO crime (criminal_id, crime_type, crime_date, description)
VALUES
(1, 'Theft', '2025-09-01', 'Stole a vehicle'),
(2, 'Fraud', '2025-09-05', 'Credit card scam');

-- Cases
INSERT INTO cases (criminal_id, officer_id, case_status, case_date)
VALUES
(1, 1, 'Open', '2025-09-10'),
(2, 2, 'In Court', '2025-09-15');

-- Courts
INSERT INTO court (case_id, hearing_date, verdict)
VALUES
(1, '2025-09-20', 'Pending'),
(2, '2025-09-25', 'Guilty');

-- Punishments
INSERT INTO punishment (court_id, punishment_type, duration, start_date)
VALUES
(2, 'Imprisonment', '2 years', '2025-09-26');

COMMIT;

-- ----------------- VERIFY -----------------
SELECT * FROM users;
SELECT * FROM police_officer;
SELECT * FROM criminal;
SELECT * FROM crime;
SELECT * FROM cases;
SELECT * FROM court;
SELECT * FROM punishment;
