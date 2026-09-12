-- ==========================================================
-- MIGRATION: Fix Foreign Key Constraint & Reset Orphaned Cars
-- Garasi Pickup Ciamis
-- ==========================================================

USE `garasi_pickup_ciamis`;

-- 1. Reset status unit mobil yang berstatus 'terjual' tetapi TIDAK memiliki record di tabel 'sales'
-- (Contoh kasus: user memilih status 'terjual' dari dropdown form mobil tanpa melewati form penjualan)
UPDATE `cars` 
SET `status` = 'tersedia' 
WHERE `status` = 'terjual' 
  AND `id` NOT IN (SELECT `car_id` FROM `sales`);

-- 2. Update Foreign Key Constraint pada tabel sales agar ON DELETE CASCADE
-- Ini memungkinkan saat unit mobil dihapus oleh admin, data riwayat sales terkait ikut terhapus secara bersih
SET FOREIGN_KEY_CHECKS = 0;

-- Cek dan drop constraint lama jika ada
ALTER TABLE `sales` DROP FOREIGN KEY IF EXISTS `sales_ibfk_1`;

-- Tambahkan kembali foreign key dengan ON DELETE CASCADE
ALTER TABLE `sales` 
ADD CONSTRAINT `fk_sales_car_id` 
FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) 
ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;

-- Konfirmasi hasil
SELECT 'Migrasi berhasil diselesaikan!' AS status;
