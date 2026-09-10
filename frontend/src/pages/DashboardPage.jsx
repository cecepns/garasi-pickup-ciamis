import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, getStatusBadge } from '../utils/formatters';
import StatCard from '../components/StatCard';
import CarDetailModal from '../components/CarDetailModal';
import { LoadingSkeleton } from '../components/EmptyState';
import { 
  Truck, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  ChevronRight,
  Eye,
  Wrench,
  BookmarkCheck,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DashboardPage({ onOpenAddModal }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await request.get(API_ENDPOINTS.DASHBOARD.STATS);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat statistik: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenDetail = (car) => {
    setSelectedCar(car);
    setIsDetailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  // Hitung total aset unit tersedia
  const totalAssetReady = stats?.recent_cars
    ? stats.recent_cars
        .filter((c) => c.status === 'tersedia')
        .reduce((sum, c) => sum + Number(c.total_modal || c.harga_beli || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Showroom
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan ketersediaan stok unit pickup, omset, dan realisasi laba showroom
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-sm active:scale-98 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Unit Pickup</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards dengan Palet Warna Menarik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unit Tersedia"
          value={`${stats?.units_available || 0} Unit`}
          subtitle={`Siap Jual di Garasi`}
          icon={Truck}
          color="blue"
          badgeText="Stok Ready"
        />

        <StatCard
          title="Unit Terjual"
          value={`${stats?.units_sold || 0} Unit`}
          subtitle="Total Unit Terjual"
          icon={ShoppingBag}
          color="purple"
          badgeText="Lunas"
        />

        <StatCard
          title="Total Omset"
          value={formatRupiah(stats?.total_omset || 0)}
          subtitle="Gross Pendapatan"
          icon={DollarSign}
          color="amber"
          badgeText="Realisasi"
        />

        <StatCard
          title="Laba Bersih"
          value={formatRupiah(stats?.total_keuntungan || 0)}
          subtitle="Keuntungan Bersih"
          icon={TrendingUp}
          color="emerald"
          badgeText="+ Profit"
        />
      </div>

      {/* Quick Status Sub-Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/30 border border-amber-200/80 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-300 text-amber-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-950 block">Dalam Perbaikan (Servis)</span>
              <span className="text-[11px] text-amber-700">Unit sedang direkondisi di bengkel garasi</span>
            </div>
          </div>
          <span className="text-xl font-bold text-amber-900 bg-white px-3 py-1 rounded-lg border border-amber-200 shadow-xs">
            {stats?.units_repair || 0}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/30 border border-sky-200/80 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-300 text-sky-700 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-sky-950 block">Sudah Dibooking Konsumen</span>
              <span className="text-[11px] text-sky-700">Dalam antrean transaksi pembayaran</span>
            </div>
          </div>
          <span className="text-xl font-bold text-sky-900 bg-white px-3 py-1 rounded-lg border border-sky-200 shadow-xs">
            {stats?.units_booking || 0}
          </span>
        </div>
      </div>

      {/* Grid: Penjualan Bulanan & Stok Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ringkasan Bulanan */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                Penjualan Bulanan
              </h2>
              <span className="text-[11px] font-medium text-slate-400">Realisasi</span>
            </div>

            {stats?.monthly_sales && stats.monthly_sales.length > 0 ? (
              <div className="space-y-4">
                {stats.monthly_sales.map((item, idx) => {
                  const maxProfit = Math.max(...stats.monthly_sales.map((s) => Number(s.profit || 0)), 1);
                  const pct = Math.min(100, Math.round((Number(item.profit || 0) / maxProfit) * 100));

                  return (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          {item.bulan} ({item.units} unit terjual)
                        </span>
                        <span className="font-bold text-emerald-600">
                          {formatRupiah(item.profit)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 text-right">
                        Omset: <span className="font-medium text-slate-700">{formatRupiah(item.omset)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-400">
                Belum ada transaksi penjualan tercatat.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <Link
              to="/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Buka Laporan Keuangan Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tabel Stok Terkini */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Unit Masuk Terbaru
                </h2>
                <p className="text-[11px] text-slate-500">Stok pickup yang baru didaftarkan ke garasi</p>
              </div>
              <Link
                to="/cars"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition"
              >
                <span>Semua Stok ({stats?.units_available || 0})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                    <th className="py-2.5 px-3.5">Unit Pickup</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Total Modal</th>
                    <th className="py-2.5 px-3.5 text-right">Harga Jual</th>
                    <th className="py-2.5 px-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats?.recent_cars && stats.recent_cars.length > 0 ? (
                    stats.recent_cars.map((car) => {
                      const badge = getStatusBadge(car.status);
                      const totalModal = Number(car.total_modal || car.harga_beli);

                      return (
                        <tr key={car.id} className="hover:bg-slate-50/80 transition">
                          {/* Unit Pickup */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs tracking-tight">
                                {car.plat_nomor}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                {car.tahun}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                              {car.merk} {car.model}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>

                          {/* Total Modal */}
                          <td className="py-3 px-3.5 text-right font-medium text-slate-700 whitespace-nowrap">
                            {formatRupiah(totalModal)}
                          </td>

                          {/* Harga Jual */}
                          <td className="py-3 px-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                            {formatRupiah(car.harga_jual_target)}
                          </td>

                          {/* Aksi Button */}
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(car)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-2xs"
                              title="Lihat Detail Unit"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        Belum ada unit pickup terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedCar && (
        <CarDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCar(null);
          }}
          car={selectedCar}
        />
      )}
    </div>
  );
}
