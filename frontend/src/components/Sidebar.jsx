import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  ShoppingBag, 
  FileSpreadsheet, 
  Users,
  Tag,
  X, 
  MapPin,
  LogOut
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onLogout, currentUser = null }) {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Stok Pickup', href: '/cars', icon: Truck },
    { name: 'Merek Mobil', href: '/brands', icon: Tag },
    { name: 'Data Penjualan', href: '/sales', icon: ShoppingBag },
    { name: 'Laporan Keuangan', href: '/reports', icon: FileSpreadsheet },
    { name: 'Kelola Admin', href: '/users', icon: Users },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container - Clean White */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Logo Garasi Pickup Ciamis"
              className="w-11 h-11 object-contain flex-shrink-0"
            />
            <div>
              <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">
                GARASI PICKUP
              </h1>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-500 inline" /> Ciamis
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.href === '/'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-orange-50 text-orange-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Admin & Logout */}
        <div className="p-3 border-t border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <NavLink
              to="/users"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition group"
              title="Buka Kelola Akun Admin"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center flex-shrink-0 uppercase group-hover:scale-105 transition">
                {currentUser?.nama ? currentUser.nama.charAt(0) : 'A'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 block truncate group-hover:text-orange-600 transition">
                  {currentUser?.nama || 'Admin'}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  @{currentUser?.username || 'admin'}
                </span>
              </div>
            </NavLink>

            <div className="flex items-center gap-1">
              <NavLink
                to="/users"
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition"
                title="Kelola Admin"
              >
                <Users className="w-3.5 h-3.5" />
              </NavLink>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition"
                  title="Keluar (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
