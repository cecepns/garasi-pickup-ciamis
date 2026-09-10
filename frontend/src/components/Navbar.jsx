import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Plus, Calendar, KeyRound, Users } from 'lucide-react';

export default function Navbar({ 
  onOpenSidebar, 
  onOpenAddModal, 
  currentUser = null,
  onChangePassword = null 
}) {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{today}</span>
        </div>
      </div>

      {/* Right: Quick Action & Admin Shortcuts */}
      <div className="flex items-center space-x-2">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs transition"
          title="Buka Kelola Akun Admin"
        >
          <Users className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Kelola Admin</span>
        </Link>

        {onChangePassword && (
          <button
            type="button"
            onClick={onChangePassword}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs transition"
            title="Ganti Password Akun Saya"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Ubah Password</span>
          </button>
        )}

        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xs active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Unit Baru</span>
          </button>
        )}
      </div>
    </header>
  );
}
