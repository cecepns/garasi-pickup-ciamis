import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Tag, FileText } from 'lucide-react';

export default function BrandModal({
  isOpen,
  onClose,
  brand = null,
  onSubmit,
  isLoading = false,
}) {
  const isEdit = Boolean(brand?.id);

  const [formData, setFormData] = useState({
    nama: '',
    keterangan: '',
  });

  useEffect(() => {
    if (brand && isEdit) {
      setFormData({
        nama: brand.nama || '',
        keterangan: brand.keterangan || '',
      });
    } else {
      setFormData({
        nama: '',
        keterangan: '',
      });
    }
  }, [brand, isEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Merek: ${brand.nama}` : 'Tambah Merek Mobil Baru'}
      size="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Nama Merek */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Nama Merek Mobil <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              placeholder="Contoh: Suzuki, Daihatsu, Toyota..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
            />
            <Tag className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Keterangan / Deskripsi Populer */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Keterangan / Tipe Populer (Opsional)
          </label>
          <div className="relative">
            <input
              type="text"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              placeholder="Contoh: New Carry, Futura 1.5, Gran Max..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
            />
            <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Merek'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
