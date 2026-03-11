/* Creating a table for the different venues */
CREATE TABLE IF NOT EXISTS venues (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
category VARCHAR(100),
location VARCHAR(100),
address VARCHAR(255),
description TEXT,
website VARCHAR(255),
rating INT,
opening_hours VARCHAR(100),
maps_link TEXT
);


/* Creating a table for the potential users */
CREATE TABLE IF NOT EXISTS users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(100) NOT NULL UNIQUE,
password VARCHAR(255) NOT NULL,
role VARCHAR(20) DEFAULT 'user'
);


/* Adding a premade admin user who is allowed to make changes on page */
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin123', 'admin');


INSERT IGNORE INTO users (username, password, role)
VALUES ('admin', 'admin123', 'admin');