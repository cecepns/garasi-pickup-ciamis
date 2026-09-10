import React, { useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Harap isi username dan password!');
      return;
    }

    try {
      setIsLoading(true);
      const res = await request.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.success) {
        toast.success('Login berhasil!');
        const sessionData = {
          token: res.data?.token || 'session_active',
          user: res.data?.user || { username: 'admin', name: 'Admin' },
        };
        localStorage.setItem('garasi_auth', JSON.stringify(sessionData));
        if (onLoginSuccess) {
          onLoginSuccess(sessionData);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        {/* Header & Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Logo Garasi Pickup Ciamis"
            className="w-20 h-20 mx-auto object-contain mb-3"
          />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Garasi Pickup Ciamis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Masuk ke panel manajemen showroom
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memproses...' : 'Masuk'}</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Akun demo: username: <strong className="text-slate-600">admin</strong> | password: <strong className="text-slate-600">admin</strong> (atau <strong className="text-slate-600">admin123</strong>)
        </p>
      </div>
    </div>
  );
}
