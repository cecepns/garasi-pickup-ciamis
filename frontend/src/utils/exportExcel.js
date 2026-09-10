import * as XLSX from 'xlsx';

/**
 * Utility untuk export laporan penjualan ke format Excel (.xlsx) langsung dari browser
 */
export const exportSalesToExcel = (salesData, summary = null, dateFilter = null) => {
  if (!salesData || salesData.length === 0) {
    throw new Error('Tidak ada data penjualan untuk diekspor.');
  }

  // Siapkan data baris untuk sheet
  const rows = salesData.map((s, index) => ({
    'No': index + 1,
    'Tanggal Terjual': s.tanggal_terjual ? String(s.tanggal_terjual).split('T')[0] : '-',
    'Plat Nomor': s.plat_nomor || '-',
    'Merk Unit': s.merk || '-',
    'Model / Tipe Pickup': s.model || '-',
    'Tahun': s.tahun || '-',
    'Harga Beli (Modal Awal)': Number(s.harga_beli || 0),
    'Biaya Perbaikan': Number(s.total_perbaikan || 0),
    'Total Modal Pokok': Number(s.total_biaya_modal || 0),
    'Harga Jual Realisasi': Number(s.harga_jual_realisasi || 0),
    'Keuntungan (Laba Bersih)': Number(s.keuntungan || 0),
    'Nama Pembeli': s.nama_pembeli || '-',
    'No. WhatsApp / HP': s.no_telepon || '-',
    'Alamat Pembeli': s.alamat_pembeli || '-',
    'Metode Pembayaran': (s.metode_pembayaran || 'cash').toUpperCase(),
    'Catatan': s.catatan_penjualan || '-',
  }));

  // Hitung total akumulatif
  const sumModal = salesData.reduce((acc, s) => acc + Number(s.total_biaya_modal || 0), 0);
  const sumOmset = salesData.reduce((acc, s) => acc + Number(s.harga_jual_realisasi || 0), 0);
  const sumProfit = salesData.reduce((acc, s) => acc + Number(s.keuntungan || 0), 0);

  // Baris Total di paling bawah
  rows.push({
    'No': '',
    'Tanggal Terjual': '',
    'Plat Nomor': '',
    'Merk Unit': '',
    'Model / Tipe Pickup': 'TOTAL KESELURUHAN',
    'Tahun': `${salesData.length} Unit`,
    'Harga Beli (Modal Awal)': '',
    'Biaya Perbaikan': '',
    'Total Modal Pokok': sumModal,
    'Harga Jual Realisasi': sumOmset,
    'Keuntungan (Laba Bersih)': sumProfit,
    'Nama Pembeli': '',
    'No. WhatsApp / HP': '',
    'Alamat Pembeli': '',
    'Metode Pembayaran': '',
    'Catatan': `Rata-rata Laba: Rp ${Math.round(sumProfit / salesData.length).toLocaleString('id-ID')}`,
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Atur lebar kolom (Auto-fit width)
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 15 }, // Tanggal Terjual
    { wch: 14 }, // Plat Nomor
    { wch: 14 }, // Merk Unit
    { wch: 25 }, // Model / Tipe
    { wch: 8 },  // Tahun
    { wch: 22 }, // Harga Beli
    { wch: 18 }, // Biaya Perbaikan
    { wch: 22 }, // Total Modal
    { wch: 22 }, // Harga Jual Realisasi
    { wch: 24 }, // Keuntungan
    { wch: 24 }, // Nama Pembeli
    { wch: 18 }, // No HP
    { wch: 35 }, // Alamat
    { wch: 16 }, // Metode Pembayaran
    { wch: 30 }, // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

  // Generate filename dengan tanggal hari ini
  const today = new Date().toISOString().split('T')[0];
  const filename = `Laporan-Penjualan-Garasi-Pickup-Ciamis-${today}.xlsx`;

  XLSX.writeFile(workbook, filename);
  return filename;
};
