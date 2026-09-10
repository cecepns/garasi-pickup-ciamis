import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, formatDate } from '../utils/formatters';
import { exportSalesToExcel } from '../utils/exportExcel';
import SaleDetailModal from '../components/SaleDetailModal';
import { LoadingSkeleton, EmptyState } from '../components/EmptyState';
import { 
  FileSpreadsheet, 
  Download, 
  Eye,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filter Periode
  const [periodPreset, setPeriodPreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Detail Modal
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await request.get(API_ENDPOINTS.REPORTS.SALES, params);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

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
    if (!reportData?.sales || reportData.sales.length === 0) {
      toast.error('Tidak ada data penjualan untuk diekspor!');
      return;
    }

    try {
      setIsExporting(true);
      const filename = exportSalesToExcel(reportData.sales, reportData.summary);
      toast.success(`Export berhasil: ${filename}`);
    } catch (err) {
      toast.error('Gagal export: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const summary = reportData?.summary || {};
  const sales = reportData?.sales || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekap pendapatan, modal, dan laba penjualan
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          disabled={sales.length === 0 || isExporting}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs active:scale-95 disabled:opacity-50 transition self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Unit Terjual</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {summary.total_unit_terjual || 0} unit
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Modal</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {formatRupiah(summary.total_modal || 0)}
          </span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Total Omset</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            {formatRupiah(summary.total_omset || 0)}
          </span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-700 block">Laba Bersih</span>
          <span className="text-xl font-bold text-emerald-600 mt-1 block">
            {formatRupiah(summary.total_keuntungan || 0)}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Preset Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handlePeriodPresetChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
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
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
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
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              periodPreset === 'this_year'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tahun Ini
          </button>
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2 text-xs text-slate-600">
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

      {/* Table Laporan - Clean, Crisp & Concise */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : sales.length === 0 ? (
        <EmptyState
          title="Tidak ada transaksi pada periode ini"
          description="Pilih rentang tanggal lain atau pilih 'Semua'."
          icon={FileSpreadsheet}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
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
                          setIsDetailOpen(true);
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
                    {formatRupiah(summary.total_modal || 0)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-900 whitespace-nowrap">
                    {formatRupiah(summary.total_omset || 0)}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-600 whitespace-nowrap">
                    {formatRupiah(summary.total_keuntungan || 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
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
