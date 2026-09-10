import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatRupiah } from '../utils/formatters';
import { TrendingUp, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellCarModal({
  isOpen,
  onClose,
  car,
  onSubmit,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    tanggal_terjual: new Date().toISOString().split('T')[0],
    nama_pembeli: '',
    no_telepon: '',
    nik_ktp: '',
    alamat_pembeli: '',
    metode_pembayaran: 'cash',
    harga_jual_realisasi: '',
    catatan_penjualan: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (car && isOpen) {
      setFormData({
        tanggal_terjual: new Date().toISOString().split('T')[0],
        nama_pembeli: '',
        no_telepon: '',
        nik_ktp: '',
        alamat_pembeli: '',
        metode_pembayaran: 'cash',
        harga_jual_realisasi: car.harga_jual_target || '',
        catatan_penjualan: '',
      });
      setErrors({});
    }
  }, [car, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const totalBiayaModal = Number(car?.total_modal || car?.harga_beli || 0);
  const hargaJualReal = Number(formData.harga_jual_realisasi || 0);
  const keuntungan = hargaJualReal > 0 ? hargaJualReal - totalBiayaModal : 0;

  const validate = () => {
    const newErrors = {};
    if (!formData.nama_pembeli.trim()) newErrors.nama_pembeli = 'Wajib diisi';
    if (!formData.no_telepon.trim()) newErrors.no_telepon = 'Wajib diisi';
    if (!formData.alamat_pembeli.trim()) newErrors.alamat_pembeli = 'Wajib diisi';
    if (!formData.harga_jual_realisasi || Number(formData.harga_jual_realisasi) <= 0) {
      newErrors.harga_jual_realisasi = 'Harus lebih dari 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi data penjualan');
      return;
    }

    onSubmit({
      car_id: car.id,
      ...formData,
      harga_jual_realisasi: parseFloat(formData.harga_jual_realisasi),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Penjualan Unit"
      subtitle={`${car?.plat_nomor || ''} • ${car?.merk || ''} ${car?.model || ''}`}
      maxWidth="max-w-xl"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Ringkasan Modal & Laba */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Total Modal Pokok:</span>
            <span className="font-semibold text-slate-800">{formatRupiah(totalBiayaModal)}</span>
          </div>
          <div className="flex justify-between text-slate-900 font-medium">
            <span>Harga Jual Deal:</span>
            <span className="font-bold">{formatRupiah(hargaJualReal)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 pt-1.5 border-t border-slate-200 font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Laba Bersih:
            </span>
            <span>{formatRupiah(keuntungan)}</span>
          </div>
        </div>

        {/* Harga Jual & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Harga Jual Deal (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="harga_jual_realisasi"
              value={formData.harga_jual_realisasi}
              onChange={handleChange}
              placeholder="105000000"
              className={`w-full bg-white border ${
                errors.harga_jual_realisasi ? 'border-rose-400' : 'border-slate-200'
              } rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-1 focus:ring-slate-400 outline-none`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tanggal Terjual <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="tanggal_terjual"
              value={formData.tanggal_terjual}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Data Pembeli */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">
            Data Pembeli
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nama Pembeli <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="nama_pembeli"
                value={formData.nama_pembeli}
                onChange={handleChange}
                placeholder="Bpk. H. Rahmat"
                className={`w-full bg-white border ${
                  errors.nama_pembeli ? 'border-rose-400' : 'border-slate-200'
                } rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none`}
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                No. HP / WA <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="no_telepon"
                value={formData.no_telepon}
                onChange={handleChange}
                placeholder="08123456789"
                className={`w-full bg-white border ${
                  errors.no_telepon ? 'border-rose-400' : 'border-slate-200'
                } rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Metode Bayar</label>
              <select
                name="metode_pembayaran"
                value={formData.metode_pembayaran}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
              >
                <option value="cash">Tunai / Cash</option>
                <option value="transfer">Transfer Bank</option>
                <option value="kredit">Kredit / Leasing</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">NIK KTP (opsional)</label>
              <input
                type="text"
                name="nik_ktp"
                value={formData.nik_ktp}
                onChange={handleChange}
                placeholder="320701..."
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Alamat Pembeli <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="alamat_pembeli"
              value={formData.alamat_pembeli}
              onChange={handleChange}
              placeholder="Ciamis"
              className={`w-full bg-white border ${
                errors.alamat_pembeli ? 'border-rose-400' : 'border-slate-200'
              } rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Catatan Penjualan</label>
            <input
              type="text"
              name="catatan_penjualan"
              value={formData.catatan_penjualan}
              onChange={handleChange}
              placeholder="BPKB STNK diserahkan lengkap"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Simpan Penjualan</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
