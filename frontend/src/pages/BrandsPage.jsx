import React, { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatDate } from '../utils/formatters';
import BrandModal from '../components/BrandModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import EmptyState, { LoadingSkeleton } from '../components/EmptyState';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Truck,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search minimal 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
      };

      const res = await request.get(API_ENDPOINTS.BRANDS.LIST, { params });
      if (res.success) {
        setBrands(res.data || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      toast.error('Gagal memuat daftar merek: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingBrand?.id) {
        const res = await request.put(API_ENDPOINTS.BRANDS.UPDATE(editingBrand.id), formData);
        if (res.success) {
          toast.success(res.message || 'Merek mobil berhasil diperbarui!');
          setIsModalOpen(false);
          setEditingBrand(null);
          fetchBrands();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.BRANDS.CREATE, formData);
        if (res.success) {
          toast.success(res.message || 'Merek mobil baru berhasil ditambahkan!');
          setIsModalOpen(false);
          fetchBrands();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan merek mobil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    try {
      setIsDeleting(true);
      const res = await request.delete(API_ENDPOINTS.BRANDS.DELETE(brandToDelete.id));
      if (res.success) {
        toast.success(res.message || 'Merek mobil berhasil dihapus.');
        setIsDeleteDialogOpen(false);
        setBrandToDelete(null);
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus merek mobil.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Master Merek Mobil
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola daftar merek mobil pickup (Suzuki, Daihatsu, Mitsubishi, dll) secara dinamis
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBrand(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Merek Mobil</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama merek atau tipe model..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 outline-none transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Total Merek: <strong className="text-slate-800">{pagination.total}</strong>
        </span>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} />
          </div>
        ) : brands.length === 0 ? (
          <EmptyState
            title="Tidak Ada Merek Mobil Ditemukan"
            description="Belum ada data merek mobil yang cocok dengan pencarian."
            actionText="Tambah Merek Baru"
            onAction={() => {
              setEditingBrand(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-3 px-4">Nama Merek</th>
                  <th className="py-3 px-4">Keterangan / Tipe Populer</th>
                  <th className="py-3 px-4 text-center">Unit di Garasi</th>
                  <th className="py-3 px-4">Tanggal Input</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition">
                    {/* Nama Merek */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 font-bold flex items-center justify-center text-xs">
                          {b.nama.charAt(0)}
                        </div>
                        <span>{b.nama}</span>
                      </div>
                    </td>

                    {/* Keterangan */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {b.keterangan || '-'}
                    </td>

                    {/* Unit di Garasi */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <Truck className="w-3.5 h-3.5" />
                        {b.total_units || 0} Unit
                      </span>
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(b.created_at)}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBrand(b);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Edit Merek"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBrandToDelete(b);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus Merek"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && brands.length > 0 && (
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

      {/* Brand Modal */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBrand(null);
        }}
        brand={editingBrand}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setBrandToDelete(null);
        }}
        title="Hapus Merek Mobil?"
        message={`Apakah Anda yakin ingin menghapus merek "${brandToDelete?.nama}"? Jika merek ini sedang digunakan oleh unit mobil, sistem akan mencegah penghapusan.`}
        confirmText="Hapus Merek"
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDanger={true}
      />
    </div>
  );
}
