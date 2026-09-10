import React, { useState, useEffect, useCallback } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, formatDate } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import Pagination from '../components/Pagination';
import SaleDetailModal from '../components/SaleDetailModal';
import { EmptyState, LoadingSkeleton } from '../components/EmptyState';
import { 
  ShoppingBag, 
  Search, 
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail Modal
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await request.get(API_ENDPOINTS.SALES.LIST, params);
      if (res.success) {
        setSales(res.data || []);
        if (res.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: res.pagination.total,
            totalPages: res.pagination.totalPages,
          }));
        }
      }
    } catch (err) {
      toast.error('Gagal memuat penjualan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, startDate, endDate]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch, startDate, endDate]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Penjualan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Riwayat unit pickup yang telah terjual
          </p>
        </div>

        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Laporan & Excel</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pembeli atau plat nomor..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 outline-none transition"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
          />
          <span className="text-slate-400">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
          />
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-[11px] text-slate-500 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded-md"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Penjualan - Clean & Concise */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : sales.length === 0 ? (
        <EmptyState
          title="Belum ada transaksi penjualan"
          description="Unit yang terjual akan otomatis tercatat di sini."
          icon={ShoppingBag}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Unit Pickup</th>
                  <th className="py-3 px-4">Pembeli</th>
                  <th className="py-3 px-4 text-right">Harga Deal</th>
                  <th className="py-3 px-4 text-right">Laba Bersih</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(sale.tanggal_terjual)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block text-sm">
                        {sale.plat_nomor}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {sale.merk} {sale.model}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {sale.nama_pembeli}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block max-w-[200px]">
                        {sale.no_telepon}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(sale.harga_jual_realisasi)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {formatRupiah(sale.keuntungan)}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSale(sale);
                          setIsDetailOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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

      {/* Detail Modal */}
      <SaleDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
      />
    </div>
  );
}
