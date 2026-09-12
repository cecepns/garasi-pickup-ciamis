-- Database Schema untuk Garasi Pickup Mobil Ciamis
-- Terstruktur dan siap production

CREATE DATABASE IF NOT EXISTS `garasi_pickup_ciamis` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `garasi_pickup_ciamis`;

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
  FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON DELETE CASCADE,
  INDEX `idx_sales_date` (`tanggal_terjual`),
  INDEX `idx_sales_pembeli` (`nama_pembeli`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data Realistis
INSERT INTO `cars` (`id`, `plat_nomor`, `merk`, `model`, `tahun`, `warna`, `kilometer`, `bahan_bakar`, `transmisi`, `tanggal_masuk`, `harga_beli`, `harga_jual_target`, `foto_utama`, `status`, `deskripsi_kondisi`) VALUES
(1, 'Z 8923 WA', 'Suzuki', 'New Carry Wide Deck', 2022, 'Putih', 34000, 'Bensin', 'Manual', '2025-01-10', 98000000.00, 115000000.00, NULL, 'tersedia', 'Kondisi mesin halus, bak rata orisinil, siap pakai angkut niaga.'),
(2, 'Z 8104 TA', 'Daihatsu', 'Gran Max 1.5 AC PS', 2021, 'Hitam', 48000, 'Bensin', 'Manual', '2025-01-15', 92000000.00, 108000000.00, NULL, 'perbaikan', 'AC dingin, Power Steering enteng, sedang ganti kampas rem dan servis oli berkala.'),
(3, 'Z 8455 YA', 'Mitsubishi', 'Colt L300 Pick Up Standard', 2020, 'Hitam', 72000, 'Diesel', 'Manual', '2025-01-20', 110000000.00, 128000000.00, NULL, 'tersedia', 'Torsi diesel sangat bertenaga, sasis utuh no keropos, ban 85%.'),
(4, 'Z 8712 KB', 'Isuzu', 'Traga Flat Deck', 2021, 'Putih', 55000, 'Diesel', 'Manual', '2025-02-01', 135000000.00, 155000000.00, NULL, 'booking', 'Kabin lega Euro 4 ready, sudah dibooking konsumen dari Banjarsari.'),
(5, 'Z 8341 TC', 'Suzuki', 'Carry Futura 1.5 FD', 2019, 'Biru Metalik', 62000, 'Bensin', 'Manual', '2024-12-05', 72000000.00, 85000000.00, NULL, 'terjual', 'Unit segar, bak baru dicat rapi.');

INSERT INTO `car_repairs` (`car_id`, `nama_perbaikan`, `biaya`, `tanggal`, `bengkel_catatan`) VALUES
(1, 'Ganti Oli Mesin SGO + Filter Oli', 450000.00, '2025-01-12', 'Servis rutin berkala oli 10W-40'),
(1, 'Tune Up & Spooring Balancing', 350000.00, '2025-01-13', 'Biar stir stabil saat muatan'),
(2, 'Servis AC & Cuci Evaporator', 750000.00, '2025-01-16', 'Penggantian freon R134a dan oli kompresor'),
(2, 'Ganti Kampas Rem Depan Belakang', 550000.00, '2025-01-17', 'Kampas rem baru genuine parts'),
(5, 'Cat Ulang Bak & Poles Body Kabin', 1800000.00, '2024-12-08', 'Rekondisi cat bak agar mulus menarik pembeli'),
(5, 'Ganti 2 Ban Baru Depan Dunlop', 1200000.00, '2024-12-09', 'Ban depan sudah tipis diganti baru');

INSERT INTO `sales` (`car_id`, `tanggal_terjual`, `nama_pembeli`, `no_telepon`, `nik_ktp`, `alamat_pembeli`, `metode_pembayaran`, `harga_jual_realisasi`, `total_biaya_modal`, `keuntungan`, `catatan_penjualan`) VALUES
(5, '2024-12-28', 'Haji Dadan Suganda', '081223456789', '3207011405780002', 'Jl. Jenderal Sudirman No. 45, Maleber, Ciamis', 'cash', 84500000.00, 75000000.00, 9500000.00, 'Pembayaran lunas cash di garasi, BPKB & STNK diserahkan langsung.');
