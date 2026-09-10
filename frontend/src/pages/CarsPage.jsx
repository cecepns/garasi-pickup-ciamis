import React, { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, getStatusBadge } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/Pagination';
import CarFormModal from '../components/CarFormModal';
import CarRepairModal from '../components/CarRepairModal';
import SellCarModal from '../components/SellCarModal';
import CarDetailModal from '../components/CarDetailModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { 
  Truck, 
  Search, 
  Plus, 
  ShoppingBag, 
  Edit, 
  Trash2, 
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CarsPage({ openCreateModalKey, onAddSuccess }) {
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [statusFilter, setStatusFilter] = useState('semua');
  const [merkFilter, setMerkFilter] = useState('semua');
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    request.get(API_ENDPOINTS.BRANDS.LIST, { params: { all: 'true' } })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setBrands(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCarForEdit, setSelectedCarForEdit] = useState(null);
  const [isSubmittingCar, setIsSubmittingCar] = useState(false);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedCarForRepair, setSelectedCarForRepair] = useState(null);

  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedCarForSell, setSelectedCarForSell] = useState(null);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCarForDetail, setSelectedCarForDetail] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Cars
  const fetchCars = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        status: statusFilter === 'semua' ? 'all' : statusFilter,
        merk: merkFilter === 'semua' ? 'all' : merkFilter,
      };

      const res = await request.get(API_ENDPOINTS.CARS.LIST, params);
      if (res.success) {
        setCars(res.data || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      toast.error('Gagal memuat data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, statusFilter, merkFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, statusFilter, merkFilter]);

  useEffect(() => {
    if (openCreateModalKey) {
      setSelectedCarForEdit(null);
      setIsFormModalOpen(true);
    }
  }, [openCreateModalKey]);

  // Handle Create / Edit Car Submit
  const handleCarSubmit = async (formData) => {
    try {
      setIsSubmittingCar(true);
      let res;
      if (selectedCarForEdit) {
        res = await request.upload(
          API_ENDPOINTS.CARS.UPDATE(selectedCarForEdit.id),
          formData,
          'put'
        );
      } else {
        res = await request.upload(
          API_ENDPOINTS.CARS.CREATE,
          formData,
          'post'
        );
      }

      if (res.success) {
        toast.success(res.message || 'Unit berhasil disimpan');
        setIsFormModalOpen(false);
        setSelectedCarForEdit(null);
        fetchCars();
        if (onAddSuccess) onAddSuccess();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan unit');
    } finally {
      setIsSubmittingCar(false);
    }
  };

  // Handle Sell Car Submit
  const handleSellSubmit = async (saleData) => {
    try {
      setIsSubmittingSale(true);
      const res = await request.post(API_ENDPOINTS.SALES.CREATE, saleData);
      if (res.success) {
        toast.success('Penjualan berhasil dicatat');
        setIsSellModalOpen(false);
        setSelectedCarForSell(null);
        fetchCars();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan penjualan');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // Handle Delete Car
  const confirmDeleteCar = async () => {
    if (!carToDelete) return;
    try {
      setIsDeleting(true);
      const res = await request.delete(API_ENDPOINTS.CARS.DELETE(carToDelete.id));
      if (res.success) {
        toast.success('Unit berhasil dihapus');
        setIsDeleteOpen(false);
        setCarToDelete(null);
        fetchCars();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus unit');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Stok Pickup
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar unit dan status showroom
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedCarForEdit(null);
            setIsFormModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Unit</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari plat nomor atau tipe..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
          >
            <option value="semua">Semua Status</option>
            <option value="tersedia">Tersedia</option>
            <option value="perbaikan">Perbaikan</option>
            <option value="booking">Booking</option>
            <option value="terjual">Terjual</option>
          </select>

          <select
            value={merkFilter}
            onChange={(e) => setMerkFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
          >
            <option value="semua">Semua Merk</option>
            {brands.length > 0 ? (
              brands.map((b) => (
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
          </select>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : cars.length === 0 ? (
        <EmptyState
          title="Tidak ada unit ditemukan"
          description="Coba gunakan kata kunci pencarian atau filter yang berbeda."
          actionText="Tambah Unit Baru"
          onAction={() => {
            setSelectedCarForEdit(null);
            setIsFormModalOpen(true);
          }}
          icon={Truck}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Unit Pickup</th>
                  <th className="py-3 px-4">Tahun</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Modal</th>
                  <th className="py-3 px-4 text-right">Harga Jual</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {cars.map((car) => {
                  const badge = getStatusBadge(car.status);
                  const totalModal = Number(car.total_modal || car.harga_beli);

                  return (
                    <tr key={car.id} className="hover:bg-slate-50/80 transition">
                      {/* Unit & Plat */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-sm">
                          {car.plat_nomor}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {car.merk} {car.model}
                        </span>
                      </td>

                      {/* Tahun */}
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {car.tahun}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Total Modal */}
                      <td className="py-3 px-4 text-right font-medium text-slate-700 whitespace-nowrap">
                        {formatRupiah(totalModal)}
                      </td>

                      {/* Harga Jual */}
                      <td className="py-3 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                        {car.status === 'terjual' && car.harga_jual_realisasi ? (
                          formatRupiah(car.harga_jual_realisasi)
                        ) : (
                          formatRupiah(car.harga_jual_target)
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Detail Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCarForDetail(car);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Jual Button (jika belum terjual) */}
                          {car.status !== 'terjual' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCarForSell(car);
                                setIsSellModalOpen(true);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition"
                              title="Catat Penjualan"
                            >
                              Jual
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCarForEdit(car);
                              setIsFormModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setCarToDelete(car);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t border-slate-100">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              limit={pagination.limit}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onLimitChange={(limit) => setPagination((prev) => ({ ...prev, limit, page: 1 }))}
            />
          </div>
        </div>
      )}

      {/* DETAIL MODAL (Menampilkan seluruh data rinci tanpa memenuhi table) */}
      <CarDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedCarForDetail(null);
        }}
        car={selectedCarForDetail}
        onOpenRepair={(c) => {
          setSelectedCarForRepair(c);
          setIsRepairModalOpen(true);
        }}
        onOpenSell={(c) => {
          setSelectedCarForSell(c);
          setIsSellModalOpen(true);
        }}
        onOpenEdit={(c) => {
          setSelectedCarForEdit(c);
          setIsFormModalOpen(true);
        }}
      />

      {/* MODAL FORM CREATE / EDIT */}
      <CarFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCarForEdit(null);
        }}
        onSubmit={handleCarSubmit}
        initialData={selectedCarForEdit}
        isLoading={isSubmittingCar}
      />

      {/* MODAL BIAYA PERBAIKAN */}
      <CarRepairModal
        isOpen={isRepairModalOpen}
        onClose={() => {
          setIsRepairModalOpen(false);
          setSelectedCarForRepair(null);
        }}
        car={selectedCarForRepair}
        onRepairUpdated={fetchCars}
      />

      {/* MODAL PENJUALAN */}
      <SellCarModal
        isOpen={isSellModalOpen}
        onClose={() => {
          setIsSellModalOpen(false);
          setSelectedCarForSell(null);
        }}
        car={selectedCarForSell}
        onSubmit={handleSellSubmit}
        isLoading={isSubmittingSale}
      />

      {/* CONFIRM DIALOG DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setCarToDelete(null);
        }}
        onConfirm={confirmDeleteCar}
        title="Hapus Unit"
        message={`Yakin ingin menghapus ${carToDelete?.plat_nomor || ''} (${carToDelete?.merk || ''} ${carToDelete?.model || ''})?`}
        confirmText="Hapus"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
