CREATE DATABASE attendance_system;

USE attendance_system;

-- Tabel roles untuk menyimpan peran (role) pengguna
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Tabel users untuk menyimpan informasi pengguna
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Tabel attendances untuk menyimpan catatan absensi
CREATE TABLE attendances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    attendance_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
INSERT INTO roles (name) VALUES ('admin'), ('user'),('karyawan');
INSERT INTO users (username,password) VALUES ('harry','123'),('timothy','123');