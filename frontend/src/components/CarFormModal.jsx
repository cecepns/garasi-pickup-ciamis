import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Upload } from 'lucide-react';
import { getFileUrl } from '../utils/formatters';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';

export default function CarFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    plat_nomor: '',
    merk: 'Suzuki',
    model: '',
    tahun: new Date().getFullYear(),
    warna: 'Putih',
    kilometer: '',
    bahan_bakar: 'Bensin',
    transmisi: 'Manual',
    tanggal_masuk: new Date().toISOString().split('T')[0],
    harga_beli: '',
    harga_jual_target: '',
    status: 'tersedia',
    deskripsi_kondisi: '',
  });

  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    if (isOpen) {
      request.get(API_ENDPOINTS.BRANDS.LIST, { params: { all: 'true' } })
        .then((res) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setAvailableBrands(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        plat_nomor: initialData.plat_nomor || '',
        merk: initialData.merk || 'Suzuki',
        model: initialData.model || '',
        tahun: initialData.tahun || new Date().getFullYear(),
        warna: initialData.warna || 'Putih',
        kilometer: initialData.kilometer !== undefined ? initialData.kilometer : '',
        bahan_bakar: initialData.bahan_bakar || 'Bensin',
        transmisi: initialData.transmisi || 'Manual',
        tanggal_masuk: initialData.tanggal_masuk ? String(initialData.tanggal_masuk).split('T')[0] : new Date().toISOString().split('T')[0],
        harga_beli: initialData.harga_beli || '',
        harga_jual_target: initialData.harga_jual_target || '',
        status: initialData.status || 'tersedia',
        deskripsi_kondisi: initialData.deskripsi_kondisi || '',
      });
      setPreviewUrl(initialData.foto_utama ? getFileUrl(initialData.foto_utama) : '');
    } else {
      setFormData({
        plat_nomor: '',
        merk: 'Suzuki',
        model: '',
        tahun: new Date().getFullYear(),
        warna: 'Putih',
        kilometer: '',
        bahan_bakar: 'Bensin',
        transmisi: 'Manual',
        tanggal_masuk: new Date().toISOString().split('T')[0],
        harga_beli: '',
        harga_jual_target: '',
        status: 'tersedia',
        deskripsi_kondisi: '',
      });
      setPreviewUrl('');
    }
    setFotoFile(null);
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran foto maksimal 5MB');
        return;
      }
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.plat_nomor.trim()) newErrors.plat_nomor = 'Wajib diisi';
    if (!formData.merk.trim()) newErrors.merk = 'Wajib diisi';
    if (!formData.model.trim()) newErrors.model = 'Wajib diisi';
    if (!formData.tahun) newErrors.tahun = 'Wajib diisi';
    if (!formData.harga_beli || Number(formData.harga_beli) <= 0) {
      newErrors.harga_beli = 'Harus lebih dari 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Mohon lengkapi data yang wajib diisi');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (fotoFile) {
      data.append('foto_utama', fotoFile);
    }

    onSubmit(data);
  };

  const pickupPresets = [
    { merk: 'Suzuki', model: 'Carry Wide Deck' },
    { merk: 'Daihatsu', model: 'Gran Max 1.5' },
    { merk: 'Mitsubishi', model: 'Colt L300' },
    { merk: 'Isuzu', model: 'Traga' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Unit Pickup' : 'Tambah Unit Masuk'}
      maxWidth="max-w-2xl"
      isLoading={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Quick Model Selector */}
        {!initialData && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            <span className="text-slate-400 font-medium">Pilih cepat:</span>
            {pickupPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, merk: p.merk, model: p.model }))}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-medium"
              >
                {p.merk} {p.model}
              </button>
            ))}
          </div>
        )}

        {/* Row 1: Plat, Merk, Model */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Plat Nomor <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="plat_nomor"
              value={formData.plat_nomor}
              onChange={handleChange}
              placeholder="Z 8923 WA"
              className={`w-full uppercase bg-white border ${
                errors.plat_nomor ? 'border-rose-400' : 'border-slate-200'
              } rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Merk <span className="text-rose-500">*</span>
            </label>
            <select
              name="merk"
              value={formData.merk}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            >
              {availableBrands.length > 0 ? (
                availableBrands.map((b) => (
                  <option key={b.id} value={b.nama}>
                    {b.nama}
                  </option>
                ))
              ) : (
                <>
                  <option value="Suzuki">Suzuki</option>
                  <option value="Daihatsu">Daihatsu</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Isuzu">Isuzu</option>
                  <option value="Toyota">Toyota</option>
                </>
              )}
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Model / Tipe <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="Carry Wide Deck"
              className={`w-full bg-white border ${
                errors.model ? 'border-rose-400' : 'border-slate-200'
              } rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none`}
            />
          </div>
        </div>

        {/* Row 2: Tahun, Warna, Kilometer, Bahan Bakar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Tahun <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              name="tahun"
              value={formData.tahun}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Warna</label>
            <input
              type="text"
              name="warna"
              value={formData.warna}
              onChange={handleChange}
              placeholder="Putih"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Kilometer</label>
            <input
              type="number"
              name="kilometer"
              value={formData.kilometer}
              onChange={handleChange}
              placeholder="35000"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Bahan Bakar</label>
            <select
              name="bahan_bakar"
              value={formData.bahan_bakar}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            >
              <option value="Bensin">Bensin</option>
              <option value="Diesel">Diesel</option>
            </select>
          </div>
        </div>

        {/* Row 3: Tanggal, Status, Transmisi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Tanggal Masuk</label>
            <input
              type="date"
              name="tanggal_masuk"
              value={formData.tanggal_masuk}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            >
              <option value="tersedia">Tersedia</option>
              <option value="perbaikan">Dalam Perbaikan</option>
              <option value="booking">Booking</option>
              <option value="terjual">Terjual</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Transmisi</label>
            <select
              name="transmisi"
              value={formData.transmisi}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
            >
              <option value="Manual">Manual</option>
              <option value="Otomatis">Otomatis</option>
            </select>
          </div>
        </div>

        {/* Keuangan: Harga Beli & Target Jual */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Harga Beli (Modal Awal) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="harga_beli"
                value={formData.harga_beli}
                onChange={handleChange}
                placeholder="95000000"
                className={`w-full bg-white border ${
                  errors.harga_beli ? 'border-rose-400' : 'border-slate-200'
                } rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-slate-400 outline-none`}
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Target Harga Jual
              </label>
              <input
                type="number"
                name="harga_jual_target"
                value={formData.harga_jual_target}
                onChange={handleChange}
                placeholder="110000000"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-1 focus:ring-slate-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Foto Unit */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Foto Unit</label>
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 relative group flex-shrink-0">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFotoFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute inset-0 bg-slate-900/60 text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-lg bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Upload className="w-5 h-5" />
              </div>
            )}

            <label className="flex-1 border border-slate-200 border-dashed rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition text-center">
              <span className="text-slate-600 font-medium">Klik untuk upload foto unit</span>
              <p className="text-slate-400 text-[10px] mt-0.5">JPG, PNG, WEBP (maks 5MB)</p>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Catatan Kondisi */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Catatan Kondisi</label>
          <textarea
            name="deskripsi_kondisi"
            rows="2"
            value={formData.deskripsi_kondisi}
            onChange={handleChange}
            placeholder="Pajak hidup, kondisi sasis, kelengkapan surat..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-slate-400 outline-none"
          />
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
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition active:scale-95"
          >
            {initialData ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
