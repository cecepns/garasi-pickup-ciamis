import React, { useState } from 'react';
import Modal from './Modal';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Lock, KeyRound, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePasswordModal({
  isOpen,
  onClose,
  targetUser = null,
  isSelf = false,
  onSuccess,
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSelf && !oldPassword) {
      toast.error('Harap masukkan password lama!');
      return;
    }

    if (!newPassword || newPassword.length < 5) {
      toast.error('Password baru minimal 5 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok!');
      return;
    }

    try {
      setIsLoading(true);

      if (isSelf) {
        const res = await request.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
          userId: targetUser?.id,
          username: targetUser?.username,
          oldPassword,
          newPassword,
        });

        if (res.success) {
          toast.success(res.message || 'Password berhasil diperbarui!');
          handleClose();
          if (onSuccess) onSuccess();
        }
      } else {
        // Reset password user lain oleh Super Admin
        const res = await request.put(API_ENDPOINTS.USERS.RESET_PASSWORD(targetUser?.id), {
          newPassword,
        });

        if (res.success) {
          toast.success(res.message || `Password untuk ${targetUser?.nama} berhasil direset!`);
          handleClose();
          if (onSuccess) onSuccess();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengubah password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSelf ? 'Ubah Password Saya' : `Reset Password: ${targetUser?.nama || 'Admin'}`}
      size="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 text-xs block">
              {targetUser?.nama} ({targetUser?.username})
            </span>
            <span className="text-[11px] text-slate-500 block">
              Role: <strong className="capitalize">{targetUser?.role || 'Admin'}</strong>
            </span>
          </div>
        </div>

        {isSelf && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Password Saat Ini <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Password Baru <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              required
              minLength={5}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 5 karakter"
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Ulangi Password Baru <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ketik ulang password baru"
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
