-- Database Schema untuk Garasi Pickup Mobil Ciamis
-- Terstruktur dan siap production

CREATE DATABASE IF NOT EXISTS `garasi_pickup_ciamis` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `garasi_pickup_ciamis`;

-- 1. Tabel Unit Mobil Pickup
DROP TABLE IF EXISTS `sales`;
DROP TABLE IF EXISTS `car_repairs`;
DROP TABLE IF EXISTS `cars`;

CREATE TABLE `cars` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `plat_nomor` VARCHAR(20) NOT NULL UNIQUE,
  `merk` VARCHAR(50) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `tahun` INT NOT NULL,
  `warna` VARCHAR(50) DEFAULT 'Putih',
  `kilometer` INT DEFAULT 0,
  `bahan_bakar` VARCHAR(30) DEFAULT 'Bensin',
  `transmisi` VARCHAR(30) DEFAULT 'Manual',
  `tanggal_masuk` DATE NOT NULL,
  `harga_beli` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `harga_jual_target` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `foto_utama` VARCHAR(255) NULL,
  `status` ENUM('tersedia', 'perbaikan', 'booking', 'terjual') NOT NULL DEFAULT 'tersedia',
  `deskripsi_kondisi` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_merk` (`merk`),
  INDEX `idx_plat` (`plat_nomor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Rincian Biaya Perbaikan / Rekondisi Unit
CREATE TABLE `car_repairs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `car_id` INT NOT NULL,
  `nama_perbaikan` VARCHAR(150) NOT NULL,
  `biaya` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `tanggal` DATE NOT NULL,
  `bengkel_catatan` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE CASCADE,
  INDEX `idx_repair_car` (`car_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Penjualan & Data Pembeli
CREATE TABLE `sales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `car_id` INT NOT NULL UNIQUE,
  `tanggal_terjual` DATE NOT NULL,
  `nama_pembeli` VARCHAR(150) NOT NULL,
  `no_telepon` VARCHAR(50) NOT NULL,
  `nik_ktp` VARCHAR(50) NULL,
  `alamat_pembeli` TEXT NOT NULL,
  `metode_pembayaran` ENUM('cash', 'transfer', 'kredit') NOT NULL DEFAULT 'cash',
  `harga_jual_realisasi` DECIMAL(15,2) NOT NULL,
  `total_biaya_modal` DECIMAL(15,2) NOT NULL,
  `keuntungan` DECIMAL(15,2) NOT NULL,
  `catatan_penjualan` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE RESTRICT,
  INDEX `idx_sales_date` (`tanggal_terjual`),
  INDEX `idx_sales_pembeli` (`nama_pembeli`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data Realistis Showroom Ciamis
INSERT INTO `cars` (`id`, `plat_nomor`, `merk`, `model`, `tahun`, `warna`, `kilometer`, `bahan_bakar`, `transmisi`, `tanggal_masuk`, `harga_beli`, `harga_jual_target`, `foto_utama`, `status`, `deskripsi_kondisi`) VALUES
(1, 'Z 8923 WA', 'Suzuki', 'New Carry Wide Deck', 2022, 'Putih', 34000, 'Bensin', 'Manual', '2025-01-10', 98000000.00, 115000000.00, NULL, 'tersedia', 'Kondisi mesin halus, bak rata orisinil, siap pakai angkut niaga.'),
(2, 'Z 8104 TA', 'Daihatsu', 'Gran Max 1.5 AC PS', 2021, 'Hitam', 48000, 'Bensin', 'Manual', '2025-01-15', 92000000.00, 108000000.00, NULL, 'perbaikan', 'AC dingin, Power Steering enteng, sedang ganti kampas rem dan servis oli berkala.'),
(3, 'Z 8455 YA', 'Mitsubishi', 'Colt L300 Pick Up Standard', 2020, 'Hitam', 72000, 'Diesel', 'Manual', '2025-01-20', 110000000.00, 128000000.00, NULL, 'tersedia', 'Torsi diesel sangat bertenaga, sasis utuh no keropos, ban 85%.'),
(4, 'Z 8712 KB', 'Isuzu', 'Traga Flat Deck', 2021, 'Putih', 55000, 'Diesel', 'Manual', '2025-02-01', 135000000.00, 155000000.00, NULL, 'booking', 'Kabin lega Euro 4 ready, sudah dibooking konsumen dari Banjarsari.'),
(5, 'Z 8341 TC', 'Suzuki', 'Carry Futura 1.5 FD', 2019, 'Biru Metalik', 62000, 'Bensin', 'Manual', '2024-12-05', 72000000.00, 85000000.00, NULL, 'terjual', 'Unit segar, bak baru dicat rapi.');

-- Sample Data Biaya Perbaikan
INSERT INTO `car_repairs` (`car_id`, `nama_perbaikan`, `biaya`, `tanggal`, `bengkel_catatan`) VALUES
(1, 'Ganti Oli Mesin SGO + Filter Oli', 450000.00, '2025-01-12', 'Servis rutin berkala oli 10W-40'),
(1, 'Tune Up & Spooring Balancing', 350000.00, '2025-01-13', 'Biar stir stabil saat muatan'),
(2, 'Servis AC & Cuci Evaporator', 750000.00, '2025-01-16', 'Penggantian freon R134a dan oli kompresor'),
(2, 'Ganti Kampas Rem Depan Belakang', 550000.00, '2025-01-17', 'Kampas rem baru genuine parts'),
(5, 'Cat Ulang Bak & Poles Body Kabin', 1800000.00, '2024-12-08', 'Rekondisi cat bak agar mulus menarik pembeli'),
(5, 'Ganti 2 Ban Baru Depan Dunlop', 1200000.00, '2024-12-09', 'Ban depan sudah tipis diganti baru');

-- Sample Data Penjualan (Unit #5 Terjual)
-- Modal unit #5: Beli 72.000.000 + Perbaikan (1.800.000 + 1.200.000 = 3.000.000) = 75.000.000
-- Jual realisasi: 84.500.000
-- Keuntungan: 84.500.000 - 75.000.000 = 9.500.000
INSERT INTO `sales` (`car_id`, `tanggal_terjual`, `nama_pembeli`, `no_telepon`, `nik_ktp`, `alamat_pembeli`, `metode_pembayaran`, `harga_jual_realisasi`, `total_biaya_modal`, `keuntungan`, `catatan_penjualan`) VALUES
(5, '2024-12-28', 'Haji Dadan Suganda', '081223456789', '3207011405780002', 'Jl. Jenderal Sudirman No. 45, Maleber, Ciamis', 'cash', 84500000.00, 75000000.00, 9500000.00, 'Pembayaran lunas cash di garasi, BPKB & STNK diserahkan langsung.');

-- 4. Tabel Manajemen Akun Admin / Pengguna Showroom
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'admin', 'kasir') NOT NULL DEFAULT 'admin',
  `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  `telepon` VARCHAR(30) NULL,
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data Akun Admin (Password default: admin123)
INSERT INTO `users` (`id`, `nama`, `username`, `email`, `password`, `role`, `status`, `telepon`) VALUES
(1, 'Super Admin Garasi', 'admin', 'admin@garasipickup.com', '$2b$10$TlBJcIxVQuMh1KKR.Wlfmu/FBwqFlv0GDgTEA6wBMVDln1Zks/3nO', 'superadmin', 'aktif', '081234567890'),
(2, 'Admin Showroom Ciamis', 'admin2', 'admin2@garasipickup.com', '$2b$10$TlBJcIxVQuMh1KKR.Wlfmu/FBwqFlv0GDgTEA6wBMVDln1Zks/3nO', 'admin', 'aktif', '081298765432')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);

-- 5. Tabel Data Master Merek Mobil Pickup (Dinamis)
CREATE TABLE IF NOT EXISTS `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(50) NOT NULL UNIQUE,
  `keterangan` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brand_nama` (`nama`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data Master Awal Merek Mobil
INSERT INTO `brands` (`id`, `nama`, `keterangan`) VALUES
(1, 'Suzuki', 'Pickup New Carry, Futura 1.5'),
(2, 'Daihatsu', 'Gran Max 1.3 & 1.5, Hi-Max'),
(3, 'Mitsubishi', 'Colt L300 Diesel & T120SS'),
(4, 'Isuzu', 'Traga Flat Deck & Box Euro 4'),
(5, 'Toyota', 'Hilux Single Cab & Dyna'),
(6, 'DFSK', 'Super Cab 1.5 Bensin & 1.3 Turbo Diesel'),
(7, 'Wuling', 'Formo Max 1.5')
ON DUPLICATE KEY UPDATE `nama` = VALUES(`nama`);


