import React, { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatDate } from '../utils/formatters';
import UserModal from '../components/UserModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState, { LoadingSkeleton } from '../components/EmptyState';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit, 
  Trash2, 
  KeyRound, 
  Shield, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  Filter,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search minimal 300ms sesuai aturan AGENTS.md
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        role: selectedRole,
        status: selectedStatus,
      };

      const res = await request.get(API_ENDPOINTS.USERS.LIST, params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      toast.error('Gagal memuat daftar admin: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, selectedRole, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Create or Update submit handler
  const handleUserSubmit = async (formData) => {
    try {
      setIsSubmittingUser(true);
      if (editingUser?.id) {
        // Update
        const res = await request.put(API_ENDPOINTS.USERS.UPDATE(editingUser.id), formData);
        if (res.success) {
          toast.success(res.message || 'Akun admin berhasil diperbarui!');
          setIsUserModalOpen(false);
          setEditingUser(null);
          fetchUsers();
        }
      } else {
        // Create
        const res = await request.post(API_ENDPOINTS.USERS.CREATE, formData);
        if (res.success) {
          toast.success(res.message || 'Akun admin baru berhasil ditambahkan!');
          setIsUserModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data admin.');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Delete submit handler
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      const res = await request.delete(API_ENDPOINTS.USERS.DELETE(userToDelete.id));
      if (res.success) {
        toast.success(res.message || 'Akun admin berhasil dihapus.');
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus admin.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
        return {
          label: 'Super Admin',
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
        };
      case 'kasir':
        return {
          label: 'Kasir / Staff',
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
        };
      default:
        return {
          label: 'Admin Showroom',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Kelola Akun Admin
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola hak akses pengguna, tambah akun baru, dan perbarui password admin
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setIsUserModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Admin</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, username, email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-slate-400"
          >
            <option value="all">Semua Role</option>
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin Showroom</option>
            <option value="kasir">Staff / Kasir</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 outline-none focus:border-slate-400"
          >
            <option value="all">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="Tidak Ada Akun Ditemukan"
            description="Coba ubah kata kunci pencarian atau tambahkan akun admin baru."
            actionText="Tambah Akun Admin"
            onAction={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Kontak</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Terakhir Login</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  const isMainAdmin = Number(u.id) === 1;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      {/* Nama & Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase shrink-0">
                            {u.nama ? u.nama.charAt(0) : 'A'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block text-xs">
                              {u.nama}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kontak (Email & Telp) */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>
                          <span>{u.email || '-'}</span>
                          {u.telepon && (
                            <span className="text-[11px] text-slate-400 block">
                              {u.telepon}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                        >
                          <Shield className="w-3 h-3" />
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.status === 'aktif' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Terakhir Login */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.last_login ? formatDate(u.last_login) : 'Belum pernah'}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Ubah / Reset Password */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordTargetUser(u);
                              setIsPasswordModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition"
                            title="Reset / Ubah Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit Akun */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setIsUserModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit Data Admin"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Hapus Akun */}
                          {!isMainAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserToDelete(u);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && users.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
              onLimitChange={(l) => setPagination((prev) => ({ ...prev, limit: l, page: 1 }))}
            />
          </div>
        )}
      </div>

      {/* User Create / Edit Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleUserSubmit}
        isLoading={isSubmittingUser}
      />

      {/* Reset Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordTargetUser(null);
        }}
        targetUser={passwordTargetUser}
        isSelf={false}
        onSuccess={fetchUsers}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        title="Hapus Akun Admin?"
        message={`Apakah Anda yakin ingin menghapus akun admin "${userToDelete?.nama}" (@${userToDelete?.username})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Akun"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
}
