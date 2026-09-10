import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import CarsPage from './pages/CarsPage';
import CarDetailPage from './pages/CarDetailPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import BrandsPage from './pages/BrandsPage';
import LoginPage from './pages/LoginPage';
import CarFormModal from './components/CarFormModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { request } from './utils/request';
import { API_ENDPOINTS } from './utils/endpoints';
import toast from 'react-hot-toast';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGlobalAddModalOpen, setIsGlobalAddModalOpen] = useState(false);
  const [isSubmittingGlobal, setIsSubmittingGlobal] = useState(false);
  const [isSelfPasswordModalOpen, setIsSelfPasswordModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('garasi_auth'));
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('garasi_auth');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.user || null;
      }
    } catch (e) {}
    return null;
  });

  const handleLoginSuccess = (sessionData) => {
    setCurrentUser(sessionData?.user || null);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('garasi_auth');
    setCurrentUser(null);
    setIsAuthenticated(false);
    toast.success('Anda berhasil keluar dari sistem.');
  };

  const handleGlobalAddSubmit = async (formData) => {
    try {
      setIsSubmittingGlobal(true);
      const res = await request.upload(API_ENDPOINTS.CARS.CREATE, formData, 'post');
      if (res.success) {
        toast.success(res.message || 'Unit pickup berhasil ditambahkan ke garasi!');
        setIsGlobalAddModalOpen(false);
        setRefreshKey((prev) => prev + 1);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan unit pickup.');
    } finally {
      setIsSubmittingGlobal(false);
    }
  };

  return (
    <Router>
      {/* Toast Notifikasi Global - Clean Light */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#e11d48',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="min-h-screen bg-white text-slate-900">
          {/* Sidebar Navigation */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
            currentUser={currentUser}
          />

          {/* Main Content Area */}
          <div className="lg:pl-64 flex flex-col min-h-screen min-w-0">
            {/* Top Navbar */}
            <Navbar
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onOpenAddModal={() => setIsGlobalAddModalOpen(true)}
              currentUser={currentUser}
              onChangePassword={() => setIsSelfPasswordModalOpen(true)}
            />

            {/* Page Routing */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
              <Routes>
                <Route
                  path="/"
                  element={<DashboardPage key={refreshKey} onOpenAddModal={() => setIsGlobalAddModalOpen(true)} />}
                />
                <Route
                  path="/cars"
                  element={<CarsPage key={refreshKey} onAddSuccess={() => setRefreshKey((k) => k + 1)} />}
                />
                <Route path="/cars/:id" element={<CarDetailPage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/sales" element={<SalesPage key={refreshKey} />} />
                <Route path="/reports" element={<ReportsPage key={refreshKey} />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/admin" element={<UsersPage />} />
                <Route path="/admins" element={<UsersPage />} />
                <Route path="/kelola-admin" element={<UsersPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Global Quick Add Unit Modal */}
          <CarFormModal
            isOpen={isGlobalAddModalOpen}
            onClose={() => setIsGlobalAddModalOpen(false)}
            onSubmit={handleGlobalAddSubmit}
            isLoading={isSubmittingGlobal}
          />

          {/* Self Change Password Modal */}
          <ChangePasswordModal
            isOpen={isSelfPasswordModalOpen}
            onClose={() => setIsSelfPasswordModalOpen(false)}
            targetUser={currentUser}
            isSelf={true}
            onSuccess={() => {
              toast.success('Password berhasil diperbarui.');
            }}
          />
        </div>
      )}
    </Router>
  );
}
