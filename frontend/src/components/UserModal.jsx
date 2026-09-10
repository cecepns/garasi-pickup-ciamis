import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff } from 'lucide-react';

export default function UserModal({
  isOpen,
  onClose,
  user = null,
  onSubmit,
  isLoading = false,
}) {
  const isEdit = Boolean(user?.id);

  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    telepon: '',
    role: 'admin',
    status: 'aktif',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        nama: user.nama || '',
        username: user.username || '',
        email: user.email || '',
        telepon: user.telepon || '',
        role: user.role || 'admin',
        status: user.status || 'aktif',
        password: '',
      });
    } else {
      setFormData({
        nama: '',
        username: '',
        email: '',
        telepon: '',
        role: 'admin',
        status: 'aktif',
        password: '',
      });
    }
  }, [user, isEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'username' ? value.toLowerCase().replace(/\s+/g, '') : value,
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
      title={isEdit ? `Edit Akun: ${user.nama}` : 'Tambah Akun Admin Baru'}
      size="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Nama Lengkap */}
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Budi Santoso"
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Username Login <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="admin_budi"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Email (Opsional)
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="budi@garasipickup.com"
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* No. Telepon */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nomor Telepon / WA
            </label>
            <div className="relative">
              <input
                type="text"
                name="telepon"
                value={formData.telepon}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Hak Akses / Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
            >
              <option value="admin">Admin Showroom</option>
              <option value="superadmin">Super Admin (Akses Penuh)</option>
              <option value="kasir">Staff / Kasir</option>
            </select>
          </div>

          {/* Status Akun */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Status Akun <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
            >
              <option value="aktif">Aktif (Dapat Login)</option>
              <option value="nonaktif">Nonaktif (Diblokir)</option>
            </select>
          </div>

          {/* Password (Wajib saat Tambah, Opsional saat Edit) */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {isEdit ? 'Ubah Password (Kosongkan jika tetap)' : 'Password Akun'} {!isEdit && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required={!isEdit}
                minLength={isEdit ? undefined : 5}
                value={formData.password}
                onChange={handleChange}
                placeholder={isEdit ? 'Biarkan kosong jika tidak diubah' : 'Minimal 5 karakter'}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-9 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Akun'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
