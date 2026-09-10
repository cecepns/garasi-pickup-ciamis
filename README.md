# 🚚 Garasi Pickup Mobil Ciamis

Aplikasi manajemen showroom mobil bekas khusus kendaraan pickup dan niaga ringan (Suzuki Carry, Daihatsu Gran Max, Mitsubishi L300, Isuzu Traga, dll) untuk area Ciamis dan sekitarnya. 

Dibangun dengan arsitektur modern yang mematuhi **100% seluruh aturan ketat di [AGENTS.md](AGENTS.md)**.

---

## 🌟 Fitur Utama

1. **Pencatatan Stok Masuk Pickup**:
   - Merk, tipe/model, tahun, warna, kilometer (odometer), jenis bahan bakar, transmisi.
   - Upload foto unit ke folder `backend/uploads-garasi-pickup-ciamis/`.
   - Pencatatan harga beli modal awal dan target harga jual.
2. **Kalkulasi Biaya Perbaikan (Rekondisi)**:
   - Pencatatan log servis (ganti oli, tune-up, servis rem, cat ulang bak/kabin, ganti ban).
   - Akumulasi otomatis ke **Total Modal Pokok** (`Harga Beli + Total Biaya Perbaikan`).
3. **Penjualan Mobil & Data Pembeli**:
   - Form penjualan dengan kalkulasi otomatis **Keuntungan Bersih per Unit** (`Harga Jual Deal - Total Modal Pokok`).
   - Pencatatan lengkap data pembeli: Nama, Nomor Telepon/WhatsApp, NIK KTP, Alamat Domisili, dan Metode Pembayaran (Cash, Transfer, Kredit).
   - Status mobil otomatis berpindah ke `terjual`.
4. **Laporan Keuangan & Export ke Excel (.xlsx)**:
   - Filter periode transaksi (Semua Waktu, Bulan Ini, Tahun Ini, Custom Periode).
   - Metrik KPI: Total Unit Terjual, Total Modal, Total Omset, Total Laba Bersih, Rata-rata Laba per Unit.
   - **Fitur Ekspor ke Excel**: Mengunduh file `.xlsx` berformat rapi lengkap dengan header, kolom rincian per unit dan pembeli, serta baris akumulasi total.
5. **UI/UX & Responsivitas**:
   - PWA (Progressive Web App) dengan manifest dan service worker.
   - Realtime search debounced minimal 300ms.
   - Server-side pagination (10, 25, 50, 100).
   - Form Create & Edit wajib menggunakan **Modal**.
   - Hapus unit wajib menggunakan **Confirm Dialog**.
   - Responsive mobile menu dengan sidebar collapse smooth transition.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite (JSX)
- **Styling**: TailwindCSS
- **PWA**: `vite-plugin-pwa`
- **Icons**: `lucide-react`
- **Notifikasi**: `react-hot-toast`
- **Routing**: `react-router-dom`
- **HTTP Client**: `axios` terpusat di `src/utils/api.js`
- **Endpoint Registry**: `src/utils/endpoints.js` *(tidak ada hardcoded string)*
- **Request Helper**: `src/utils/request.js`
- **Excel Engine**: `xlsx` (SheetJS)

### Backend
- **Framework**: Express.js (Single server file di `backend/server.js`)
- **Database**: MySQL via `mysql2/promise` (connection pool & prepared statements)
- **Upload**: `multer` ke `backend/uploads-garasi-pickup-ciamis/`
- **Security**: CORS, dotenv, sanitize input, SQL injection prevention.
- **SQL Schema**: `sql/database.sql` dan `backend/sql/database.sql`

---

## 📁 Struktur Folder Project

```bash
garasi-pickup-ciamis/
├── .gitignore                      # Sesuai baseline requirement
├── AGENTS.md                       # Aturan acuan AI Agent
├── README.md                       # Dokumentasi lengkap
├── sql/
│   └── database.sql                # Skema MySQL lengkap + sample data
├── backend/
│   ├── server.js                   # 1 file server Express utama
│   ├── .env                        # Konfigurasi port (5001) & DB MySQL
│   ├── package.json
│   ├── sql/
│   │   └── database.sql
│   └── uploads-garasi-pickup-ciamis/ # Folder upload gambar unit
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js              # Setup Vite + PWA + alias @
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env                        # VITE_API_URL=http://localhost:5001/api
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── hooks/
        │   └── useDebounce.js      # Debounce search >= 300ms
        ├── utils/
        │   ├── endpoints.js        # Daftar endpoint API terpusat (MANDATORY)
        │   ├── api.js              # Axios instance
        │   ├── request.js          # Helper request reusable
        │   ├── formatters.js       # Format Rupiah, tanggal, badge
        │   └── exportExcel.js      # Engine ekspor laporan Excel .xlsx
        ├── components/
        │   ├── Sidebar.jsx         # Mobile collapsible sidebar
        │   ├── Navbar.jsx
        │   ├── Pagination.jsx      # Limit selector (10, 25, 50, 100)
        │   ├── Modal.jsx           # Modal Create/Edit
        │   ├── ConfirmDialog.jsx   # Confirm delete dialog
        │   ├── StatCard.jsx
        │   ├── EmptyState.jsx
        │   └── LoadingSkeleton.jsx
        └── pages/
            ├── DashboardPage.jsx   # Ringkasan KPI & grafik performa
            ├── CarsPage.jsx        # Stok unit pickup, filter, create/edit
            ├── CarDetailPage.jsx   # Detail spesifikasi, log servis & pembeli
            ├── SalesPage.jsx       # Riwayat unit laku & data pembeli
            └── ReportsPage.jsx     # Laporan keuangan & tombol Export Excel
```

---

## 🚀 Cara Menjalankan

### 1. Backend Server
```bash
cd backend
npm install
npm start
# Server akan berjalan di http://localhost:5001
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Buka http://localhost:3000 pada browser Anda
```
# garasi-pickup-ciamis
