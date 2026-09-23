import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, formatDate } from '../utils/formatters';
import { exportSalesToExcel, exportRepairsToExcel } from '../utils/exportExcel';
import SaleDetailModal from '../components/SaleDetailModal';
import CarRepairModal from '../components/CarRepairModal';
import { LoadingSkeleton, EmptyState } from '../components/EmptyState';
import { useDebounce } from '../hooks/useDebounce';
import { 
  FileSpreadsheet, 
  Download, 
  Eye,
  ShoppingBag,
  Wrench,
  Search,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  // Active Tab: 'sales' | 'repairs'
  const [activeTab, setActiveTab] = useState('sales');

  // Sales Data State
  const [salesReportData, setSalesReportData] = useState(null);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  // Repairs Data State
  const [repairsReportData, setRepairsReportData] = useState(null);
  const [isLoadingRepairs, setIsLoadingRepairs] = useState(false);
  const [repairSearch, setRepairSearch] = useState('');
  const debouncedRepairSearch = useDebounce(repairSearch, 350);

  // Shared Filter Periode
  const [periodPreset, setPeriodPreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isExporting, setIsExporting] = useState(false);

  // Detail Modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);

  // Repair Modal Integration (untuk koreksi langsung dari laporan)
  const [selectedCarForRepair, setSelectedCarForRepair] = useState(null);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  // Fetch Sales Report
  const fetchSalesReport = async () => {
    try {
      setIsLoadingSales(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await request.get(API_ENDPOINTS.REPORTS.SALES, params);
      if (res.success) {
        setSalesReportData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan penjualan: ' + err.message);
    } finally {
      setIsLoadingSales(false);
    }
  };

  // Fetch Repairs Report
  const fetchRepairsReport = async () => {
    try {
      setIsLoadingRepairs(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (debouncedRepairSearch) params.search = debouncedRepairSearch;

      const res = await request.get(API_ENDPOINTS.REPORTS.REPAIRS, params);
      if (res.success) {
        setRepairsReportData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan pengeluaran: ' + err.message);
    } finally {
      setIsLoadingRepairs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else {
      fetchRepairsReport();
    }
  }, [activeTab, startDate, endDate, debouncedRepairSearch]);

  const handlePeriodPresetChange = (preset) => {
    setPeriodPreset(preset);
    const now = new Date();

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'this_year') {
      const firstDay = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    }
  };

  const handleExportExcel = () => {
    if (activeTab === 'sales') {
      if (!salesReportData?.sales || salesReportData.sales.length === 0) {
        toast.error('Tidak ada data penjualan untuk diekspor!');
        return;
      }
      try {
        setIsExporting(true);
        const filename = exportSalesToExcel(salesReportData.sales, salesReportData.summary);
        toast.success(`Export penjualan berhasil: ${filename}`);
      } catch (err) {
        toast.error('Gagal export: ' + err.message);
      } finally {
        setIsExporting(false);
      }
    } else {
      if (!repairsReportData?.repairs || repairsReportData.repairs.length === 0) {
        toast.error('Tidak ada data pengeluaran untuk diekspor!');
        return;
      }
      try {
        setIsExporting(true);
        const filename = exportRepairsToExcel(repairsReportData.repairs, repairsReportData.summary);
        toast.success(`Export rincian pengeluaran berhasil: ${filename}`);
      } catch (err) {
        toast.error('Gagal export: ' + err.message);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const salesSummary = salesReportData?.summary || {};
  const sales = salesReportData?.sales || [];

  const repairsSummary = repairsReportData?.summary || {};
  const repairs = repairsReportData?.repairs || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekap pendapatan, rincian pengeluaran perbaikan, dan laba showroom
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={
            isExporting || 
            (activeTab === 'sales' ? sales.length === 0 : repairs.length === 0)
          }
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-95 disabled:opacity-50 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel {activeTab === 'sales' ? 'Penjualan' : 'Pengeluaran'}</span>
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
            activeTab === 'sales'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Penjualan & Laba Unit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repairs')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
            activeTab === 'repairs'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Rincian Pengeluaran Unit (Perbaikan)</span>
        </button>
      </div>

      {/* KPI Cards: Sales Tab */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Unit Terjual</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {salesSummary.total_unit_terjual || 0} unit
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Modal Pokok</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(salesSummary.total_modal || 0)}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Omset Penjualan</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(salesSummary.total_omset || 0)}
            </span>
          </div>

          <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-emerald-700 block">Laba Bersih Realisasi</span>
            <span className="text-xl font-bold text-emerald-600 mt-1 block">
              {formatRupiah(salesSummary.total_keuntungan || 0)}
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards: Repairs Tab */}
      {activeTab === 'repairs' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-amber-700 block">Total Pengeluaran Perbaikan</span>
            <span className="text-xl font-bold text-amber-900 mt-1 block">
              {formatRupiah(repairsSummary.total_pengeluaran || 0)}
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Total Item Transaksi</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {repairsSummary.total_transaksi || 0} item
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Unit Direkondisi</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {repairsSummary.total_unit || 0} unit pickup
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Rata-rata Biaya / Unit</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatRupiah(repairsSummary.rata_rata_per_unit || 0)}
            </span>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Preset Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            type="button"
            onClick={() => handlePeriodPresetChange('all')}
            className={`flex-1 md:flex-none px-3 py-1 text-xs font-medium rounded-md transition ${
              periodPreset === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => handlePeriodPresetChange('this_month')}
            className={`flex-1 md:flex-none px-3 py-1 text-xs font-medium rounded-md transition ${
              periodPreset === 'this_month'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => handlePeriodPresetChange('this_year')}
            className={`flex-1 md:flex-none px-3 py-1 text-xs font-medium rounded-md transition ${
              periodPreset === 'this_year'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tahun Ini
          </button>
        </div>

        {/* Date Inputs & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {activeTab === 'repairs' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={repairSearch}
                onChange={(e) => setRepairSearch(e.target.value)}
                placeholder="Cari plat, item, bengkel..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 outline-none focus:bg-white focus:ring-1 focus:ring-slate-400"
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-600 w-full sm:w-auto justify-end">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setPeriodPreset('custom');
                setStartDate(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setPeriodPreset('custom');
                setEndDate(e.target.value);
              }}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Content: Sales Table */}
      {activeTab === 'sales' && (
        isLoadingSales ? (
          <LoadingSkeleton rows={5} />
        ) : sales.length === 0 ? (
          <EmptyState
            title="Tidak ada transaksi penjualan pada periode ini"
            description="Pilih rentang tanggal lain atau pilih 'Semua'."
            icon={FileSpreadsheet}
          />
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Unit Pickup</th>
                    <th className="py-3 px-3">Pembeli</th>
                    <th className="py-3 px-3 text-right">Total Modal</th>
                    <th className="py-3 px-3 text-right">Harga Jual</th>
                    <th className="py-3 px-3 text-right">Laba Bersih</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sales.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                        {formatDate(item.tanggal_terjual)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">
                          {item.plat_nomor}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.merk} {item.model}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {item.nama_pembeli}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600 whitespace-nowrap">
                        {formatRupiah(item.total_biaya_modal)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatRupiah(item.harga_jual_realisasi)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                        {formatRupiah(item.keuntungan)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSale(item);
                            setIsSaleDetailOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Table Footer Total */}
                <tfoot className="bg-slate-50 text-slate-900 border-t-2 border-slate-200 font-bold">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right text-slate-500 text-xs uppercase">
                      Total ({sales.length} Unit):
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800 whitespace-nowrap">
                      {formatRupiah(salesSummary.total_modal || 0)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 whitespace-nowrap">
                      {formatRupiah(salesSummary.total_omset || 0)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 whitespace-nowrap">
                      {formatRupiah(salesSummary.total_keuntungan || 0)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      )}

      {/* Content: Repairs / Pengeluaran Table */}
      {activeTab === 'repairs' && (
        isLoadingRepairs ? (
          <LoadingSkeleton rows={5} />
        ) : repairs.length === 0 ? (
          <EmptyState
            title="Tidak ada data pengeluaran pada periode ini"
            description="Coba ubah filter rentang tanggal atau kata kunci pencarian."
            icon={Wrench}
          />
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold">
                    <th className="py-3 px-3 w-10 text-center">No</th>
                    <th className="py-3 px-3">Tanggal</th>
                    <th className="py-3 px-3">Unit Pickup</th>
                    <th className="py-3 px-3">Item Pengeluaran / Perbaikan</th>
                    <th className="py-3 px-3">Catatan / Bengkel</th>
                    <th className="py-3 px-3 text-right">Biaya (Rp)</th>
                    <th className="py-3 px-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {repairs.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-900 block">
                          {item.plat_nomor}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.merk} {item.model} ({item.tahun})
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.nama_perbaikan}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.bengkel_catatan || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-amber-700 whitespace-nowrap">
                        {formatRupiah(item.biaya)}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCarForRepair({
                              id: item.car_id,
                              plat_nomor: item.plat_nomor,
                              merk: item.merk,
                              model: item.model,
                              harga_beli: item.harga_beli,
                            });
                            setIsRepairModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition"
                          title="Buka / Koreksi Pengeluaran Unit Ini"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Koreksi</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Table Footer Total */}
                <tfoot className="bg-slate-50 text-slate-900 border-t-2 border-slate-200 font-bold">
                  <tr>
                    <td colSpan={5} className="py-3 px-3 text-right text-slate-500 text-xs uppercase">
                      Total Pengeluaran ({repairs.length} Item Transaksi):
                    </td>
                    <td className="py-3 px-3 text-right text-amber-800 whitespace-nowrap">
                      {formatRupiah(repairsSummary.total_pengeluaran || 0)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      )}

      {/* Sale Detail Modal */}
      <SaleDetailModal
        isOpen={isSaleDetailOpen}
        onClose={() => {
          setIsSaleDetailOpen(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
      />

      {/* Car Repair Modal untuk Koreksi Pengeluaran */}
      <CarRepairModal
        isOpen={isRepairModalOpen}
        onClose={() => {
          setIsRepairModalOpen(false);
          setSelectedCarForRepair(null);
        }}
        car={selectedCarForRepair}
        onRepairUpdated={() => {
          if (activeTab === 'repairs') fetchRepairsReport();
          if (activeTab === 'sales') fetchSalesReport();
        }}
      />
    </div>
  );
}
