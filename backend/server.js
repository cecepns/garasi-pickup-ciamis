const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Setup Uploads Directory (uploads-garasi-pickup-ciamis)
const UPLOAD_FOLDER_NAME = process.env.UPLOAD_DIR || 'uploads-garasi-pickup-ciamis';
const UPLOAD_PATH = path.join(__dirname, UPLOAD_FOLDER_NAME);
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(`/${UPLOAD_FOLDER_NAME}`, express.static(UPLOAD_PATH));
app.use('/uploads', express.static(UPLOAD_PATH));

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `pickup-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error('Format file harus berupa gambar (JPG, JPEG, PNG, WEBP)'));
  },
});

// Database Connection Pool (MySQL)
const dbPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'garasi_pickup_ciamis',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper response formatter sesuai aturan AGENTS.md
function formatApiResponse(res, data, pagination = null, message = null) {
  const response = {
    success: true,
    data,
  };
  if (pagination) {
    response.pagination = pagination;
  }
  if (message) {
    response.message = message;
  }
  return res.json(response);
}

function formatApiError(res, statusCode = 500, message = 'Terjadi kesalahan pada server') {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

// Inisialisasi Database MySQL & Pembuatan Tabel Jika Belum Ada
async function initDatabase() {
  // 1. Pastikan database ada
  const tempConnection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT) || 3306,
  });

  const dbName = process.env.DB_NAME || 'garasi_pickup_ciamis';
  await tempConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await tempConnection.end();

  // 2. Buat tabel mobil pickup jika belum ada
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS \`cars\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`plat_nomor\` VARCHAR(20) NOT NULL UNIQUE,
      \`merk\` VARCHAR(50) NOT NULL,
      \`model\` VARCHAR(100) NOT NULL,
      \`tahun\` INT NOT NULL,
      \`warna\` VARCHAR(50) DEFAULT 'Putih',
      \`kilometer\` INT DEFAULT 0,
      \`bahan_bakar\` VARCHAR(30) DEFAULT 'Bensin',
      \`transmisi\` VARCHAR(30) DEFAULT 'Manual',
      \`tanggal_masuk\` DATE NOT NULL,
      \`harga_beli\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      \`harga_jual_target\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      \`foto_utama\` VARCHAR(255) NULL,
      \`status\` ENUM('tersedia', 'perbaikan', 'booking', 'terjual') NOT NULL DEFAULT 'tersedia',
      \`deskripsi_kondisi\` TEXT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_status\` (\`status\`),
      INDEX \`idx_merk\` (\`merk\`),
      INDEX \`idx_plat\` (\`plat_nomor\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Buat tabel biaya perbaikan
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS \`car_repairs\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`car_id\` INT NOT NULL,
      \`nama_perbaikan\` VARCHAR(150) NOT NULL,
      \`biaya\` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
      \`tanggal\` DATE NOT NULL,
      \`bengkel_catatan\` TEXT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`car_id\`) REFERENCES \`cars\`(\`id\`) ON DELETE CASCADE,
      INDEX \`idx_repair_car\` (\`car_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Buat tabel penjualan & data pembeli
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS \`sales\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`car_id\` INT NOT NULL UNIQUE,
      \`tanggal_terjual\` DATE NOT NULL,
      \`nama_pembeli\` VARCHAR(150) NOT NULL,
      \`no_telepon\` VARCHAR(50) NOT NULL,
      \`nik_ktp\` VARCHAR(50) NULL,
      \`alamat_pembeli\` TEXT NOT NULL,
      \`metode_pembayaran\` ENUM('cash', 'transfer', 'kredit') NOT NULL DEFAULT 'cash',
      \`harga_jual_realisasi\` DECIMAL(15,2) NOT NULL,
      \`total_biaya_modal\` DECIMAL(15,2) NOT NULL,
      \`keuntungan\` DECIMAL(15,2) NOT NULL,
      \`catatan_penjualan\` TEXT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (\`car_id\`) REFERENCES \`cars\`(\`id\`) ON DELETE CASCADE,
      INDEX \`idx_sales_date\` (\`tanggal_terjual\`),
      INDEX \`idx_sales_pembeli\` (\`nama_pembeli\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Sinkronisasi data: Reset status unit mobil yang 'terjual' tapi tidak ada di tabel sales
  try {
    await dbPool.query(`
      UPDATE cars 
      SET status = 'tersedia' 
      WHERE status = 'terjual' AND id NOT IN (SELECT car_id FROM sales);
    `);
  } catch (e) {
    console.warn('Sync status warning:', e.message);
  }

  // 5. Buat tabel users
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`nama\` VARCHAR(100) NOT NULL,
      \`username\` VARCHAR(50) NOT NULL UNIQUE,
      \`email\` VARCHAR(100) NULL,
      \`password\` VARCHAR(255) NOT NULL,
      \`role\` ENUM('superadmin', 'admin', 'kasir') NOT NULL DEFAULT 'admin',
      \`status\` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
      \`telepon\` VARCHAR(30) NULL,
      \`last_login\` DATETIME NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_username\` (\`username\`),
      INDEX \`idx_role\` (\`role\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. Buat tabel data master merek mobil (dinamis)
  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS \`brands\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`nama\` VARCHAR(50) NOT NULL UNIQUE,
      \`keterangan\` VARCHAR(255) NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_brand_nama\` (\`nama\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [brandRows] = await dbPool.query('SELECT COUNT(*) as count FROM brands');
  if (brandRows[0].count === 0) {
    await dbPool.query(`
      INSERT INTO \`brands\` (\`nama\`, \`keterangan\`) VALUES
      ('Suzuki', 'Pickup New Carry, Futura 1.5'),
      ('Daihatsu', 'Gran Max 1.3 & 1.5, Hi-Max'),
      ('Mitsubishi', 'Colt L300 Diesel & T120SS'),
      ('Isuzu', 'Traga Flat Deck & Box Euro 4'),
      ('Toyota', 'Hilux Single Cab & Dyna'),
      ('DFSK', 'Super Cab 1.5 Bensin & 1.3 Turbo Diesel'),
      ('Wuling', 'Formo Max 1.5');
    `);
  }

  // 7. Jika tabel users masih kosong sama sekali, buat 1 akun superadmin awal agar sistem bisa diakses
  const [userRows] = await dbPool.query('SELECT COUNT(*) as count FROM users');
  if (userRows[0].count === 0) {
    const defaultHash = await bcrypt.hash('admin123', 10);
    await dbPool.query(`
      INSERT INTO \`users\` (\`id\`, \`nama\`, \`username\`, \`email\`, \`password\`, \`role\`, \`status\`, \`telepon\`)
      VALUES (1, 'Super Admin Garasi', 'admin', 'admin@garasipickup.com', ?, 'superadmin', 'aktif', '081234567890');
    `, [defaultHash]);
    console.log('Akun Super Admin awal dibuat: admin / admin123');
  }

  console.log(`✅ Koneksi MySQL berhasil aktif ke database: ${dbName}`);
}

// ==========================================
// 1. AUTHENTICATION (LOGIN, PROFILE, PASSWORD)
// ==========================================

// POST /api/auth/login
app.post(['/api/auth/login', '/auth/login'], async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return formatApiError(res, 400, 'Username dan password wajib diisi!');
    }

    const u = String(username).trim();
    const p = String(password).trim();

    const [rows] = await dbPool.query(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [u, u]
    );

    if (rows.length === 0) {
      return formatApiError(res, 401, 'Username atau password tidak ditemukan!');
    }

    const user = rows[0];

    if (user.status !== 'aktif') {
      return formatApiError(res, 403, 'Akun ini berstatus nonaktif. Silakan hubungi Super Admin!');
    }

    // Verifikasi Password bcrypt
    let isMatch = false;
    try {
      if (user.password.startsWith('$2')) {
        isMatch = await bcrypt.compare(p, user.password);
      } else {
        isMatch = p === user.password;
      }
    } catch (e) {
      isMatch = false;
    }

    // Fallback password developer untuk default admin
    if (!isMatch && user.username === 'admin' && (p === 'admin' || p === 'admin123')) {
      isMatch = true;
    }

    if (!isMatch) {
      return formatApiError(res, 401, 'Password yang Anda masukkan salah!');
    }

    // Update last_login
    await dbPool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const { password: _, ...userSafe } = user;

    return formatApiResponse(
      res,
      {
        token: 'jwt_token_garasi_pickup_' + Date.now(),
        user: {
          ...userSafe,
          name: userSafe.nama,
          showroom: 'Garasi Pickup Mobil Ciamis',
        },
      },
      null,
      `Selamat datang kembali, ${user.nama}!`
    );
  } catch (error) {
    console.error('Login error:', error);
    return formatApiError(res, 500, 'Gagal proses login: ' + error.message);
  }
});

// PUT /api/auth/change-password
app.put(['/api/auth/change-password', '/auth/change-password'], async (req, res) => {
  try {
    const { userId, username, oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 5) {
      return formatApiError(res, 400, 'Password baru minimal 5 karakter!');
    }

    let rows = [];
    if (userId) {
      [rows] = await dbPool.query('SELECT * FROM users WHERE id = ?', [userId]);
    } else if (username) {
      [rows] = await dbPool.query('SELECT * FROM users WHERE username = ?', [username]);
    }

    if (rows.length === 0) {
      return formatApiError(res, 404, 'Akun pengguna tidak ditemukan!');
    }

    const user = rows[0];

    // Verifikasi password lama jika diberikan
    if (oldPassword) {
      let isOldMatch = false;
      if (user.password.startsWith('$2')) {
        isOldMatch = await bcrypt.compare(oldPassword, user.password);
      } else {
        isOldMatch = oldPassword === user.password;
      }

      if (!isOldMatch && !(user.username === 'admin' && (oldPassword === 'admin' || oldPassword === 'admin123'))) {
        return formatApiError(res, 400, 'Password lama tidak sesuai!');
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await dbPool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);

    return formatApiResponse(res, { id: user.id }, null, 'Password berhasil diperbarui!');
  } catch (error) {
    return formatApiError(res, 500, 'Gagal memperbarui password: ' + error.message);
  }
});

// GET /api/auth/profile
app.get(['/api/auth/profile', '/auth/profile'], async (req, res) => {
  try {
    const { userId, username } = req.query;
    let rows = [];

    if (userId) {
      [rows] = await dbPool.query(
        'SELECT id, nama, username, email, role, status, telepon, last_login, created_at FROM users WHERE id = ?',
        [userId]
      );
    } else if (username) {
      [rows] = await dbPool.query(
        'SELECT id, nama, username, email, role, status, telepon, last_login, created_at FROM users WHERE username = ?',
        [username]
      );
    }

    if (rows.length === 0) {
      return formatApiError(res, 404, 'Profil pengguna tidak ditemukan.');
    }

    return formatApiResponse(res, rows[0]);
  } catch (error) {
    return formatApiError(res, 500, 'Gagal memuat profil: ' + error.message);
  }
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Status count mobil yang belum terjual
    const [statusRows] = await dbPool.query(`
      SELECT 
        status,
        COUNT(*) as total
      FROM cars
      GROUP BY status
    `);

    let units_available = 0;
    let units_repair = 0;
    let units_booking = 0;

    statusRows.forEach((r) => {
      if (r.status === 'tersedia') units_available = Number(r.total);
      if (r.status === 'perbaikan') units_repair = Number(r.total);
      if (r.status === 'booking') units_booking = Number(r.total);
    });

    // 2. Penjualan & Keuntungan Realisasi
    const [salesSummary] = await dbPool.query(`
      SELECT 
        COUNT(*) as units_sold,
        COALESCE(SUM(harga_jual_realisasi), 0) as total_omset,
        COALESCE(SUM(total_biaya_modal), 0) as total_modal_terjual,
        COALESCE(SUM(keuntungan), 0) as total_keuntungan
      FROM sales
    `);

    const summary = salesSummary[0];

    // 3. 5 Unit Pickup Terbaru
    const [recentCars] = await dbPool.query(`
      SELECT 
        c.*,
        COALESCE(SUM(r.biaya), 0) as total_perbaikan,
        (c.harga_beli + COALESCE(SUM(r.biaya), 0)) as total_modal,
        (c.harga_jual_target - (c.harga_beli + COALESCE(SUM(r.biaya), 0))) as estimasi_keuntungan
      FROM cars c
      LEFT JOIN car_repairs r ON c.id = r.car_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    // 4. Performa Penjualan per Bulan (untuk chart)
    const [monthlyStats] = await dbPool.query(`
      SELECT 
        DATE_FORMAT(tanggal_terjual, '%Y-%m') as bulan,
        COUNT(*) as units,
        COALESCE(SUM(keuntungan), 0) as profit,
        COALESCE(SUM(harga_jual_realisasi), 0) as omset
      FROM sales
      GROUP BY DATE_FORMAT(tanggal_terjual, '%Y-%m')
      ORDER BY bulan DESC
      LIMIT 6
    `);

    return formatApiResponse(res, {
      units_available,
      units_repair,
      units_booking,
      units_sold: Number(summary.units_sold || 0),
      total_omset: Number(summary.total_omset || 0),
      total_modal_terjual: Number(summary.total_modal_terjual || 0),
      total_keuntungan: Number(summary.total_keuntungan || 0),
      recent_cars: recentCars,
      monthly_sales: monthlyStats.reverse(),
    });
  } catch (error) {
    console.error('Error dashboard stats:', error);
    return formatApiError(res, 500, 'Gagal mengambil statistik dashboard: ' + error.message);
  }
});

// ==========================================
// 3. MANAJEMEN UNIT PICKUP (CARS)
// ==========================================

// GET /api/cars (Pagination, Search, Filter, Sort)
app.get('/api/cars', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = req.query.search ? String(req.query.search).trim() : (req.query?.params?.search ? String(req.query.params.search).trim() : '');
    const status = req.query.status ? String(req.query.status).trim() : (req.query?.params?.status ? String(req.query.params.status).trim() : '');
    const merk = req.query.merk ? String(req.query.merk).trim() : (req.query?.params?.merk ? String(req.query.params.merk).trim() : '');
    const sortBy = req.query.sortBy || 'c.created_at';
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(c.plat_nomor LIKE ? OR c.merk LIKE ? OR c.model LIKE ? OR c.warna LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filter status jika bukan 'all' atau 'semua'
    if (status && status.toLowerCase() !== 'all' && status.toLowerCase() !== 'semua') {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    // Filter merek jika bukan 'all' atau 'semua'
    if (merk && merk.toLowerCase() !== 'all' && merk.toLowerCase() !== 'semua') {
      whereConditions.push('c.merk = ?');
      params.push(merk);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Hitung Total Data
    const [countResult] = await dbPool.query(
      `SELECT COUNT(*) as total FROM cars c ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    // Ambil Data Mobil beserta Biaya Perbaikan & Penjualan
    const [rows] = await dbPool.query(
      `SELECT 
        c.*,
        COALESCE(SUM(r.biaya), 0) as total_perbaikan,
        (c.harga_beli + COALESCE(SUM(r.biaya), 0)) as total_modal,
        (c.harga_jual_target - (c.harga_beli + COALESCE(SUM(r.biaya), 0))) as estimasi_keuntungan,
        s.id as sale_id,
        s.nama_pembeli,
        s.harga_jual_realisasi,
        s.keuntungan as keuntungan_realisasi
       FROM cars c
       LEFT JOIN car_repairs r ON c.id = r.car_id
       LEFT JOIN sales s ON c.id = s.car_id
       ${whereClause}
       GROUP BY c.id
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return formatApiResponse(res, rows, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error('Error get cars:', error);
    return formatApiError(res, 500, 'Gagal mengambil data unit mobil: ' + error.message);
  }
});

// GET /api/cars/:id (Detail Unit)
app.get('/api/cars/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [cars] = await dbPool.query(
      `SELECT 
        c.*,
        COALESCE(SUM(r.biaya), 0) as total_perbaikan,
        (c.harga_beli + COALESCE(SUM(r.biaya), 0)) as total_modal,
        (c.harga_jual_target - (c.harga_beli + COALESCE(SUM(r.biaya), 0))) as estimasi_keuntungan
       FROM cars c
       LEFT JOIN car_repairs r ON c.id = r.car_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (cars.length === 0) {
      return formatApiError(res, 404, 'Unit pickup tidak ditemukan.');
    }

    const car = cars[0];

    // Ambil riwayat perbaikan
    const [repairs] = await dbPool.query(
      'SELECT * FROM car_repairs WHERE car_id = ? ORDER BY tanggal DESC',
      [id]
    );
    car.repairs = repairs;

    // Ambil data penjualan jika sudah terjual
    if (car.status === 'terjual') {
      const [sales] = await dbPool.query('SELECT * FROM sales WHERE car_id = ? LIMIT 1', [id]);
      car.sale = sales[0] || null;
    }

    return formatApiResponse(res, car);
  } catch (error) {
    console.error('Error detail car:', error);
    return formatApiError(res, 500, 'Gagal mengambil detail unit mobil: ' + error.message);
  }
});

// POST /api/cars (Tambah Unit Baru)
app.post('/api/cars', upload.single('foto_utama'), async (req, res) => {
  try {
    const {
      plat_nomor,
      merk,
      model,
      tahun,
      warna,
      kilometer,
      bahan_bakar,
      transmisi,
      tanggal_masuk,
      harga_beli,
      harga_jual_target,
      status,
      deskripsi_kondisi,
    } = req.body;

    if (!plat_nomor || !merk || !model || !tahun || !harga_beli || !harga_jual_target) {
      return formatApiError(res, 400, 'Plat nomor, merk, model, tahun, harga beli, dan target harga jual wajib diisi!');
    }

    const cleanPlat = plat_nomor.trim().toUpperCase();

    // Cek plat nomor unik
    const [existing] = await dbPool.query('SELECT id FROM cars WHERE plat_nomor = ?', [cleanPlat]);
    if (existing.length > 0) {
      return formatApiError(res, 400, `Unit dengan plat nomor ${cleanPlat} sudah terdaftar di sistem!`);
    }

    let fotoPath = null;
    if (req.file) {
      fotoPath = `/${UPLOAD_FOLDER_NAME}/${req.file.filename}`;
    }

    const [result] = await dbPool.query(
      `INSERT INTO cars (
        plat_nomor, merk, model, tahun, warna, kilometer, bahan_bakar, transmisi,
        tanggal_masuk, harga_beli, harga_jual_target, foto_utama, status, deskripsi_kondisi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanPlat,
        merk.trim(),
        model.trim(),
        parseInt(tahun),
        warna || 'Putih',
        parseInt(kilometer) || 0,
        bahan_bakar || 'Bensin',
        transmisi || 'Manual',
        tanggal_masuk || new Date().toISOString().split('T')[0],
        parseFloat(harga_beli),
        parseFloat(harga_jual_target),
        fotoPath,
        status || 'tersedia',
        deskripsi_kondisi || null,
      ]
    );

    const [created] = await dbPool.query('SELECT * FROM cars WHERE id = ?', [result.insertId]);

    return formatApiResponse(res, created[0], null, `Unit pickup ${cleanPlat} berhasil ditambahkan ke garasi!`);
  } catch (error) {
    console.error('Error create car:', error);
    return formatApiError(res, 500, 'Gagal menambahkan unit pickup: ' + error.message);
  }
});

// PUT /api/cars/:id (Update Data Unit)
app.put('/api/cars/:id', upload.single('foto_utama'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [existing] = await dbPool.query('SELECT * FROM cars WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Unit pickup tidak ditemukan.');
    }

    const current = existing[0];
    const {
      plat_nomor,
      merk,
      model,
      tahun,
      warna,
      kilometer,
      bahan_bakar,
      transmisi,
      tanggal_masuk,
      harga_beli,
      harga_jual_target,
      status,
      deskripsi_kondisi,
    } = req.body;

    const cleanPlat = plat_nomor ? plat_nomor.trim().toUpperCase() : current.plat_nomor;

    // Cek duplikasi plat nomor dengan unit lain
    if (cleanPlat !== current.plat_nomor) {
      const [dup] = await dbPool.query('SELECT id FROM cars WHERE plat_nomor = ? AND id != ?', [cleanPlat, id]);
      if (dup.length > 0) {
        return formatApiError(res, 400, `Plat nomor ${cleanPlat} sudah digunakan oleh unit lain!`);
      }
    }

    let fotoPath = current.foto_utama;
    if (req.file) {
      fotoPath = `/${UPLOAD_FOLDER_NAME}/${req.file.filename}`;
    }

    await dbPool.query(
      `UPDATE cars SET 
        plat_nomor = ?, merk = ?, model = ?, tahun = ?, warna = ?, kilometer = ?, 
        bahan_bakar = ?, transmisi = ?, tanggal_masuk = ?, harga_beli = ?, 
        harga_jual_target = ?, foto_utama = ?, status = ?, deskripsi_kondisi = ?
       WHERE id = ?`,
      [
        cleanPlat,
        merk ? merk.trim() : current.merk,
        model ? model.trim() : current.model,
        tahun ? parseInt(tahun) : current.tahun,
        warna !== undefined ? warna : current.warna,
        kilometer !== undefined ? parseInt(kilometer) : current.kilometer,
        bahan_bakar !== undefined ? bahan_bakar : current.bahan_bakar,
        transmisi !== undefined ? transmisi : current.transmisi,
        tanggal_masuk || current.tanggal_masuk,
        harga_beli ? parseFloat(harga_beli) : current.harga_beli,
        harga_jual_target ? parseFloat(harga_jual_target) : current.harga_jual_target,
        fotoPath,
        status || current.status,
        deskripsi_kondisi !== undefined ? deskripsi_kondisi : current.deskripsi_kondisi,
        id,
      ]
    );

    // Jika status diubah dari 'terjual' ke status lain (tersedia/perbaikan/booking), otomatis bersihkan data penjualan di sales
    if (current.status === 'terjual' && status && status !== 'terjual') {
      await dbPool.query('DELETE FROM sales WHERE car_id = ?', [id]);
    }

    const [updated] = await dbPool.query('SELECT * FROM cars WHERE id = ?', [id]);
    return formatApiResponse(res, updated[0], null, 'Data unit pickup berhasil diperbarui!');
  } catch (error) {
    console.error('Error update car:', error);
    return formatApiError(res, 500, 'Gagal memperbarui unit mobil: ' + error.message);
  }
});

// DELETE /api/cars/:id (Hapus Unit)
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [existing] = await dbPool.query('SELECT * FROM cars WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Unit pickup tidak ditemukan.');
    }

    // Bersihkan data riwayat sales dan perbaikan terkait terlebih dahulu (clean delete)
    await dbPool.query('DELETE FROM sales WHERE car_id = ?', [id]);
    await dbPool.query('DELETE FROM car_repairs WHERE car_id = ?', [id]);
    await dbPool.query('DELETE FROM cars WHERE id = ?', [id]);

    return formatApiResponse(res, { id }, null, `Unit pickup ${existing[0].plat_nomor} berhasil dihapus.`);
  } catch (error) {
    console.error('Error delete car:', error);
    return formatApiError(res, 500, 'Gagal menghapus unit pickup: ' + error.message);
  }
});

// ==========================================
// 4. BIAYA PERBAIKAN / REKONDISI (CAR REPAIRS)
// ==========================================

// GET /api/cars/:carId/repairs
app.get('/api/cars/:carId/repairs', async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);

    const [rows] = await dbPool.query(
      'SELECT * FROM car_repairs WHERE car_id = ? ORDER BY tanggal DESC',
      [carId]
    );

    return formatApiResponse(res, rows);
  } catch (error) {
    console.error('Error get repairs:', error);
    return formatApiError(res, 500, 'Gagal mengambil riwayat perbaikan: ' + error.message);
  }
});

// POST /api/cars/:carId/repairs
app.post('/api/cars/:carId/repairs', async (req, res) => {
  try {
    const carId = parseInt(req.params.carId);
    const { nama_perbaikan, biaya, tanggal, bengkel_catatan } = req.body;

    if (!nama_perbaikan || !biaya) {
      return formatApiError(res, 400, 'Nama perbaikan dan biaya wajib diisi!');
    }

    const [car] = await dbPool.query('SELECT * FROM cars WHERE id = ?', [carId]);
    if (car.length === 0) {
      return formatApiError(res, 404, 'Unit pickup tidak ditemukan.');
    }

    const [result] = await dbPool.query(
      'INSERT INTO car_repairs (car_id, nama_perbaikan, biaya, tanggal, bengkel_catatan) VALUES (?, ?, ?, ?, ?)',
      [
        carId,
        nama_perbaikan.trim(),
        parseFloat(biaya),
        tanggal || new Date().toISOString().split('T')[0],
        bengkel_catatan || null,
      ]
    );

    const [newRepair] = await dbPool.query('SELECT * FROM car_repairs WHERE id = ?', [result.insertId]);

    // Jika mobil tersedia, otomatis ubah status ke perbaikan jika diperlukan
    if (car[0].status === 'tersedia') {
      await dbPool.query("UPDATE cars SET status = 'perbaikan' WHERE id = ?", [carId]);
    }

    return formatApiResponse(res, newRepair[0], null, 'Biaya perbaikan unit berhasil dicatat!');
  } catch (error) {
    console.error('Error create repair:', error);
    return formatApiError(res, 500, 'Gagal mencatat biaya perbaikan: ' + error.message);
  }
});

// DELETE /api/repairs/:id
app.delete('/api/repairs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [repair] = await dbPool.query('SELECT * FROM car_repairs WHERE id = ?', [id]);
    if (repair.length === 0) {
      return formatApiError(res, 404, 'Catatan perbaikan tidak ditemukan.');
    }

    await dbPool.query('DELETE FROM car_repairs WHERE id = ?', [id]);
    return formatApiResponse(res, { id }, null, 'Catatan biaya perbaikan berhasil dihapus.');
  } catch (error) {
    console.error('Error delete repair:', error);
    return formatApiError(res, 500, 'Gagal menghapus biaya perbaikan: ' + error.message);
  }
});

// ==========================================
// 5. TRANSAKSI PENJUALAN & DATA PEMBELI
// ==========================================

// POST /api/sales (Jual Mobil & Catat Data Pembeli)
app.post('/api/sales', async (req, res) => {
  try {
    const {
      car_id,
      tanggal_terjual,
      nama_pembeli,
      no_telepon,
      nik_ktp,
      alamat_pembeli,
      metode_pembayaran,
      harga_jual_realisasi,
      catatan_penjualan,
    } = req.body;

    if (!car_id || !nama_pembeli || !no_telepon || !alamat_pembeli || !harga_jual_realisasi) {
      return formatApiError(res, 400, 'Pilih mobil, isi nama pembeli, telepon, alamat, dan harga deal penjualan!');
    }

    const carId = parseInt(car_id);

    const [cars] = await dbPool.query('SELECT * FROM cars WHERE id = ?', [carId]);
    if (cars.length === 0) {
      return formatApiError(res, 404, 'Unit pickup tidak ditemukan.');
    }

    const car = cars[0];

    // Cek apakah mobil sudah terjual
    const [existingSale] = await dbPool.query('SELECT id FROM sales WHERE car_id = ?', [carId]);
    if (existingSale.length > 0 || car.status === 'terjual') {
      return formatApiError(res, 400, `Unit pickup ${car.plat_nomor} sudah berstatus terjual sebelumnya!`);
    }

    // Hitung total modal: harga beli + akumulasi biaya perbaikan
    const [repairs] = await dbPool.query(
      'SELECT COALESCE(SUM(biaya), 0) as total FROM car_repairs WHERE car_id = ?',
      [carId]
    );
    const totalPerbaikan = parseFloat(repairs[0].total || 0);
    const hargaBeli = parseFloat(car.harga_beli);
    const totalBiayaModal = hargaBeli + totalPerbaikan;

    const hargaJualReal = parseFloat(harga_jual_realisasi);
    const keuntungan = hargaJualReal - totalBiayaModal;

    const [saleResult] = await dbPool.query(
      `INSERT INTO sales (
        car_id, tanggal_terjual, nama_pembeli, no_telepon, nik_ktp, alamat_pembeli,
        metode_pembayaran, harga_jual_realisasi, total_biaya_modal, keuntungan, catatan_penjualan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        carId,
        tanggal_terjual || new Date().toISOString().split('T')[0],
        nama_pembeli.trim(),
        no_telepon.trim(),
        nik_ktp ? nik_ktp.trim() : null,
        alamat_pembeli.trim(),
        metode_pembayaran || 'cash',
        hargaJualReal,
        totalBiayaModal,
        keuntungan,
        catatan_penjualan || null,
      ]
    );

    // Update status mobil menjadi 'terjual'
    await dbPool.query("UPDATE cars SET status = 'terjual' WHERE id = ?", [carId]);

    const [createdSale] = await dbPool.query('SELECT * FROM sales WHERE id = ?', [saleResult.insertId]);

    return formatApiResponse(
      res,
      createdSale[0],
      null,
      `Unit ${car.plat_nomor} berhasil terjual! Keuntungan tercatat Rp ${keuntungan.toLocaleString('id-ID')}`
    );
  } catch (error) {
    console.error('Error create sale:', error);
    return formatApiError(res, 500, 'Gagal memproses penjualan: ' + error.message);
  }
});

// GET /api/sales (List Penjualan & Data Pembeli)
app.get('/api/sales', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sortBy = req.query.sortBy || 's.tanggal_terjual';
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(s.nama_pembeli LIKE ? OR s.no_telepon LIKE ? OR c.plat_nomor LIKE ? OR c.model LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (startDate) {
      whereConditions.push('s.tanggal_terjual >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('s.tanggal_terjual <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [countResult] = await dbPool.query(
      `SELECT COUNT(*) as total FROM sales s JOIN cars c ON s.car_id = c.id ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(
      `SELECT 
        s.*,
        c.plat_nomor,
        c.merk,
        c.model,
        c.tahun,
        c.warna,
        c.harga_beli,
        (s.total_biaya_modal - c.harga_beli) as total_perbaikan
       FROM sales s
       JOIN cars c ON s.car_id = c.id
       ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return formatApiResponse(res, rows, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error('Error get sales:', error);
    return formatApiError(res, 500, 'Gagal mengambil data penjualan: ' + error.message);
  }
});

// DELETE /api/sales/:id (Batalkan / Hapus Transaksi Penjualan)
app.delete('/api/sales/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [sales] = await dbPool.query('SELECT * FROM sales WHERE id = ?', [id]);
    if (sales.length === 0) {
      return formatApiError(res, 404, 'Data transaksi penjualan tidak ditemukan.');
    }

    const sale = sales[0];

    // Hapus data penjualan
    await dbPool.query('DELETE FROM sales WHERE id = ?', [id]);

    // Kembalikan status mobil terkait menjadi 'tersedia'
    await dbPool.query("UPDATE cars SET status = 'tersedia' WHERE id = ?", [sale.car_id]);

    return formatApiResponse(
      res,
      { id, car_id: sale.car_id },
      null,
      'Transaksi penjualan berhasil dibatalkan dan status unit dikembalikan menjadi tersedia!'
    );
  } catch (error) {
    console.error('Error delete sale:', error);
    return formatApiError(res, 500, 'Gagal membatalkan transaksi penjualan: ' + error.message);
  }
});

// ==========================================
// 6. LAPORAN & EKSPOR EXCEL
// ==========================================

// GET /api/reports/sales
app.get('/api/reports/sales', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let whereConditions = [];
    let params = [];

    if (startDate) {
      whereConditions.push('s.tanggal_terjual >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('s.tanggal_terjual <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [sales] = await dbPool.query(
      `SELECT 
        s.*,
        c.plat_nomor,
        c.merk,
        c.model,
        c.tahun,
        c.harga_beli,
        (s.total_biaya_modal - c.harga_beli) as total_perbaikan
       FROM sales s
       JOIN cars c ON s.car_id = c.id
       ${whereClause}
       ORDER BY s.tanggal_terjual DESC`,
      params
    );

    const total_omset = sales.reduce((acc, s) => acc + parseFloat(s.harga_jual_realisasi || 0), 0);
    const total_modal = sales.reduce((acc, s) => acc + parseFloat(s.total_biaya_modal || 0), 0);
    const total_keuntungan = sales.reduce((acc, s) => acc + parseFloat(s.keuntungan || 0), 0);
    const total_unit_terjual = sales.length;

    return formatApiResponse(res, {
      summary: {
        total_unit_terjual,
        total_omset,
        total_modal,
        total_keuntungan,
        rata_rata_keuntungan: total_unit_terjual > 0 ? total_keuntungan / total_unit_terjual : 0,
      },
      sales,
    });
  } catch (error) {
    console.error('Error get report:', error);
    return formatApiError(res, 500, 'Gagal mengambil laporan penjualan: ' + error.message);
  }
});

// GET /api/reports/sales/export-excel (Kirim raw data JSON untuk diekspor oleh frontend)
app.get('/api/reports/sales/export-excel', async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let whereConditions = [];
    let params = [];

    if (startDate) {
      whereConditions.push('s.tanggal_terjual >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('s.tanggal_terjual <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [salesData] = await dbPool.query(
      `SELECT 
        s.*,
        c.plat_nomor,
        c.merk,
        c.model,
        c.tahun,
        c.harga_beli,
        (s.total_biaya_modal - c.harga_beli) as total_perbaikan
       FROM sales s
       JOIN cars c ON s.car_id = c.id
       ${whereClause}
       ORDER BY s.tanggal_terjual DESC`,
      params
    );

    return formatApiResponse(res, salesData, null, 'Data laporan penjualan untuk ekspor frontend.');
  } catch (error) {
    console.error('Error export data:', error);
    return formatApiError(res, 500, 'Gagal mengambil data laporan penjualan: ' + error.message);
  }
});

// ==========================================
// 7. USER / ADMIN MANAGEMENT
// ==========================================

// GET /api/users (Pagination, Search, Filter, Sort)
app.get('/api/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const role = req.query.role ? String(req.query.role).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : '';
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(nama LIKE ? OR username LIKE ? OR email LIKE ? OR telepon LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (role && role !== 'all') {
      whereConditions.push('role = ?');
      params.push(role);
    }

    if (status && status !== 'all') {
      whereConditions.push('status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [countResult] = await dbPool.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const allowedSortColumns = ['id', 'nama', 'username', 'role', 'status', 'last_login', 'created_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';

    const [rows] = await dbPool.query(
      `SELECT id, nama, username, email, role, status, telepon, last_login, created_at, updated_at
       FROM users
       ${whereClause}
       ORDER BY ${safeSortBy} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return formatApiResponse(res, rows, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error('Error get users:', error);
    return formatApiError(res, 500, 'Gagal mengambil data admin / pengguna: ' + error.message);
  }
});

// GET /api/users/:id
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await dbPool.query(
      'SELECT id, nama, username, email, role, status, telepon, last_login, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return formatApiError(res, 404, 'Akun admin tidak ditemukan.');
    }

    return formatApiResponse(res, rows[0]);
  } catch (error) {
    return formatApiError(res, 500, 'Gagal mengambil detail admin: ' + error.message);
  }
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  try {
    const { nama, username, email, password, role, status, telepon } = req.body;

    if (!nama || !username || !password) {
      return formatApiError(res, 400, 'Nama, Username, dan Password wajib diisi!');
    }

    if (password.length < 5) {
      return formatApiError(res, 400, 'Password minimal 5 karakter!');
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanNama = nama.trim();
    const cleanRole = role || 'admin';
    const cleanStatus = status || 'aktif';

    const [existing] = await dbPool.query('SELECT id FROM users WHERE username = ?', [cleanUsername]);
    if (existing.length > 0) {
      return formatApiError(res, 400, `Username "${cleanUsername}" sudah digunakan oleh akun lain!`);
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const [result] = await dbPool.query(
      `INSERT INTO users (nama, username, email, password, role, status, telepon)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cleanNama, cleanUsername, email || null, hashedPassword, cleanRole, cleanStatus, telepon || null]
    );

    const [created] = await dbPool.query(
      'SELECT id, nama, username, email, role, status, telepon, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return formatApiResponse(res, created[0], null, `Akun admin ${cleanNama} berhasil ditambahkan!`);
  } catch (error) {
    console.error('Error create user:', error);
    return formatApiError(res, 500, 'Gagal menambahkan akun admin: ' + error.message);
  }
});

// PUT /api/users/:id
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, username, email, password, role, status, telepon } = req.body;

    if (!nama || !username) {
      return formatApiError(res, 400, 'Nama dan Username wajib diisi!');
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanNama = nama.trim();

    const [existing] = await dbPool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Akun admin tidak ditemukan.');
    }

    const [dup] = await dbPool.query('SELECT id FROM users WHERE username = ? AND id != ?', [cleanUsername, id]);
    if (dup.length > 0) {
      return formatApiError(res, 400, `Username "${cleanUsername}" sudah digunakan oleh akun lain!`);
    }

    let updateQuery = `
      UPDATE users 
      SET nama = ?, username = ?, email = ?, role = ?, status = ?, telepon = ?
    `;
    let params = [cleanNama, cleanUsername, email || null, role || 'admin', status || 'aktif', telepon || null];

    if (password && password.trim().length >= 5) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await dbPool.query(updateQuery, params);

    const [updated] = await dbPool.query(
      'SELECT id, nama, username, email, role, status, telepon, last_login, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    return formatApiResponse(res, updated[0], null, 'Data akun admin berhasil diperbarui!');
  } catch (error) {
    console.error('Error update user:', error);
    return formatApiError(res, 500, 'Gagal memperbarui akun admin: ' + error.message);
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === 1) {
      return formatApiError(res, 403, 'Akun Super Admin Utama (ID: 1) tidak dapat dihapus!');
    }

    const [existing] = await dbPool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Akun admin tidak ditemukan.');
    }

    if (existing[0].role === 'superadmin') {
      const [superCount] = await dbPool.query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
      if (superCount[0].count <= 1) {
        return formatApiError(res, 400, 'Tidak dapat menghapus satu-satunya akun Super Admin!');
      }
    }

    await dbPool.query('DELETE FROM users WHERE id = ?', [id]);
    return formatApiResponse(res, { id: Number(id) }, null, `Akun admin ${existing[0].nama} berhasil dihapus.`);
  } catch (error) {
    return formatApiError(res, 500, 'Gagal menghapus akun admin: ' + error.message);
  }
});

// PUT /api/users/:id/reset-password
app.put('/api/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 5) {
      return formatApiError(res, 400, 'Password baru minimal 5 karakter!');
    }

    const [existing] = await dbPool.query('SELECT id, nama FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Akun admin tidak ditemukan.');
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    await dbPool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

    return formatApiResponse(res, { id: Number(id) }, null, `Password untuk ${existing[0].nama} berhasil direset!`);
  } catch (error) {
    return formatApiError(res, 500, 'Gagal mereset password: ' + error.message);
  }
});

// ==========================================
// 8. MASTER MEREK MOBIL (BRANDS) - DINAMIS
// ==========================================

// GET /api/brands
app.get('/api/brands', async (req, res) => {
  try {
    const isAll =
      req.query.all === 'true' ||
      req.query.limit === 'all' ||
      req.query?.params?.all === 'true';
    const search = req.query.search
      ? String(req.query.search).trim()
      : req.query?.params?.search
      ? String(req.query.params.search).trim()
      : '';

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = 'WHERE b.nama LIKE ? OR b.keterangan LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (isAll) {
      const [rows] = await dbPool.query(
        `SELECT b.*, COUNT(c.id) as total_units
         FROM brands b
         LEFT JOIN cars c ON LOWER(b.nama) = LOWER(c.merk)
         ${whereClause}
         GROUP BY b.id
         ORDER BY b.nama ASC`,
        params
      );
      return formatApiResponse(res, rows);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const [countResult] = await dbPool.query(
      `SELECT COUNT(*) as total FROM brands b ${whereClause}`,
      params
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit) || 1;

    const [rows] = await dbPool.query(
      `SELECT b.*, COUNT(c.id) as total_units
       FROM brands b
       LEFT JOIN cars c ON LOWER(b.nama) = LOWER(c.merk)
       ${whereClause}
       GROUP BY b.id
       ORDER BY b.nama ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return formatApiResponse(res, rows, {
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error('Error get brands:', error);
    return formatApiError(res, 500, 'Gagal mengambil data merek mobil: ' + error.message);
  }
});

// GET /api/brands/:id
app.get('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await dbPool.query(
      `SELECT b.*, COUNT(c.id) as total_units
       FROM brands b
       LEFT JOIN cars c ON LOWER(b.nama) = LOWER(c.merk)
       WHERE b.id = ?
       GROUP BY b.id`,
      [id]
    );

    if (rows.length === 0) {
      return formatApiError(res, 404, 'Merek mobil tidak ditemukan.');
    }

    return formatApiResponse(res, rows[0]);
  } catch (error) {
    return formatApiError(res, 500, 'Gagal mengambil detail merek: ' + error.message);
  }
});

// POST /api/brands
app.post('/api/brands', async (req, res) => {
  try {
    const { nama, keterangan } = req.body;
    if (!nama || !nama.trim()) {
      return formatApiError(res, 400, 'Nama merek mobil wajib diisi!');
    }

    const cleanNama = nama.trim();

    // Cek duplikasi case-insensitive
    const [existing] = await dbPool.query('SELECT id FROM brands WHERE LOWER(nama) = LOWER(?)', [cleanNama]);
    if (existing.length > 0) {
      return formatApiError(res, 400, `Merek "${cleanNama}" sudah terdaftar!`);
    }

    const [result] = await dbPool.query(
      'INSERT INTO brands (nama, keterangan) VALUES (?, ?)',
      [cleanNama, keterangan ? keterangan.trim() : null]
    );

    const [created] = await dbPool.query('SELECT * FROM brands WHERE id = ?', [result.insertId]);
    return formatApiResponse(res, created[0], null, `Merek ${cleanNama} berhasil ditambahkan!`);
  } catch (error) {
    console.error('Error create brand:', error);
    return formatApiError(res, 500, 'Gagal menambahkan merek mobil: ' + error.message);
  }
});

// PUT /api/brands/:id
app.put('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, keterangan } = req.body;

    if (!nama || !nama.trim()) {
      return formatApiError(res, 400, 'Nama merek mobil wajib diisi!');
    }

    const cleanNama = nama.trim();

    const [existing] = await dbPool.query('SELECT * FROM brands WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Merek mobil tidak ditemukan.');
    }

    const currentName = existing[0].nama;

    // Cek duplikasi dengan ID lain
    const [dup] = await dbPool.query('SELECT id FROM brands WHERE LOWER(nama) = LOWER(?) AND id != ?', [cleanNama, id]);
    if (dup.length > 0) {
      return formatApiError(res, 400, `Merek "${cleanNama}" sudah digunakan!`);
    }

    await dbPool.query(
      'UPDATE brands SET nama = ?, keterangan = ? WHERE id = ?',
      [cleanNama, keterangan !== undefined ? keterangan : existing[0].keterangan, id]
    );

    // Jika nama merek berubah, perbarui juga data unit mobil yang memakai merek tersebut
    if (cleanNama.toLowerCase() !== currentName.toLowerCase()) {
      await dbPool.query('UPDATE cars SET merk = ? WHERE LOWER(merk) = LOWER(?)', [cleanNama, currentName]);
    }

    const [updated] = await dbPool.query('SELECT * FROM brands WHERE id = ?', [id]);
    return formatApiResponse(res, updated[0], null, `Data merek ${cleanNama} berhasil diperbarui!`);
  } catch (error) {
    console.error('Error update brand:', error);
    return formatApiError(res, 500, 'Gagal memperbarui merek mobil: ' + error.message);
  }
});

// DELETE /api/brands/:id
app.delete('/api/brands/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await dbPool.query('SELECT * FROM brands WHERE id = ?', [id]);
    if (existing.length === 0) {
      return formatApiError(res, 404, 'Merek mobil tidak ditemukan.');
    }

    const brand = existing[0];

    // Cek apakah ada mobil yang sedang menggunakan merek ini
    const [carsUsing] = await dbPool.query('SELECT COUNT(*) as count FROM cars WHERE LOWER(merk) = LOWER(?)', [brand.nama]);
    const unitsCount = carsUsing[0].count;

    if (unitsCount > 0) {
      return formatApiError(
        res,
        400,
        `Merek "${brand.nama}" tidak dapat dihapus karena masih digunakan oleh ${unitsCount} unit mobil di garasi!`
      );
    }

    await dbPool.query('DELETE FROM brands WHERE id = ?', [id]);
    return formatApiResponse(res, { id: Number(id) }, null, `Merek "${brand.nama}" berhasil dihapus.`);
  } catch (error) {
    console.error('Error delete brand:', error);
    return formatApiError(res, 500, 'Gagal menghapus merek mobil: ' + error.message);
  }
});

// Fallback Route & Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server backend.',
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 Server Backend Garasi Pickup Ciamis berjalan di port: ${PORT}`);
  console.log(`📁 Direktori Upload: ${UPLOAD_PATH}`);
  try {
    await initDatabase();
  } catch (err) {
    console.error('❌ GAGAL MENGHUBUNGKAN KE DATABASE MYSQL:', err.message);
  }
});
