import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, formatDate, getStatusBadge, getFileUrl } from '../utils/formatters';
import CarRepairModal from '../components/CarRepairModal';
import SellCarModal from '../components/SellCarModal';
import { LoadingSkeleton } from '../components/EmptyState';
import { 
  ArrowLeft, 
  Truck, 
  Wrench, 
  ShoppingBag, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings, 
  CheckCircle2, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const fetchCarDetail = async () => {
    try {
      setIsLoading(true);
      const res = await request.get(API_ENDPOINTS.CARS.DETAIL(id));
      if (res.success) {
        setCar(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat detail unit: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCarDetail();
  }, [id]);

  const handleSellSubmit = async (saleData) => {
    try {
      setIsSubmittingSale(true);
      const res = await request.post(API_ENDPOINTS.SALES.CREATE, saleData);
      if (res.success) {
        toast.success(res.message || 'Mobil berhasil terjual!');
        setIsSellModalOpen(false);
        fetchCarDetail();
      }
    } catch (err) {
      toast.error(err.message || 'Gagal memproses penjualan.');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500">Unit tidak ditemukan.</p>
        <Link to="/cars" className="text-brand-600 hover:text-brand-700 font-medium text-xs mt-2 inline-block">
          ← Kembali ke Stok Unit
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(car.status);
  const totalModal = Number(car.total_modal || car.harga_beli);
  const estimasiUntung = Number(car.estimasi_keuntungan || (car.harga_jual_target - totalModal));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/cars')}
            className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
            title="Kembali ke Stok"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text} border ${badge.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
              <span className="text-xs text-slate-500 font-medium">Tahun {car.tahun}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              {car.plat_nomor} • {car.merk} {car.model}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRepairModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition"
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Biaya Perbaikan</span>
          </button>

          {car.status !== 'terjual' && (
            <button
              type="button"
              onClick={() => setIsSellModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Jual Mobil</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Foto & Spesifikasi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Foto Utama & Spesifikasi */}
        <div className="lg:col-span-1 space-y-4">
          <div className="h-64 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden relative shadow-xs">
            {car.foto_utama ? (
              <img
                src={getFileUrl(car.foto_utama)}
                alt={car.model}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Truck className="w-12 h-12 mb-2 text-slate-300" />
                <span className="text-xs">Foto unit belum diunggah</span>
              </div>
            )}
          </div>

          {/* Quick Specs List */}
          <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
              Spesifikasi Unit
            </h3>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Masuk:
              </span>
              <span className="font-medium text-slate-900">
                {formatDate(car.tanggal_masuk)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-400" /> Odometer:
              </span>
              <span className="font-medium text-slate-900">
                {car.kilometer ? `${car.kilometer.toLocaleString()} km` : '-'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-slate-400" /> Bahan Bakar:
              </span>
              <span className="font-medium text-slate-900">{car.bahan_bakar}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" /> Transmisi:
              </span>
              <span className="font-medium text-slate-900">{car.transmisi}</span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500">Warna Unit:</span>
              <span className="font-medium text-slate-900">{car.warna}</span>
            </div>
          </div>

          {/* Catatan Unit if any */}
          {car.catatan && (
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs">
              <span className="text-slate-500 font-medium block mb-1">Catatan Kondisi:</span>
              <p className="text-slate-700 leading-relaxed">{car.catatan}</p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Rincian Keuangan & Riwayat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rincian Finansial Unit */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-600" />
              Kalkulasi Modal & Laba
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">
                  Harga Beli Modal
                </span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {formatRupiah(car.harga_beli)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200">
                <span className="text-xs text-amber-700 block">
                  Biaya Perbaikan
                </span>
                <span className="text-base font-bold text-amber-900 mt-1 block">
                  + {formatRupiah(car.total_perbaikan || 0)}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-brand-50/50 border border-brand-200">
                <span className="text-xs text-brand-700 block">
                  Total Modal Pokok
                </span>
                <span className="text-base font-bold text-brand-900 mt-1 block">
                  = {formatRupiah(totalModal)}
                </span>
              </div>
            </div>

            {/* Target Jual vs Realisasi */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block">
                  {car.status === 'terjual' ? 'Harga Jual Realisasi:' : 'Target Harga Jual:'}
                </span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                  {car.status === 'terjual' && car.sale?.harga_jual_realisasi
                    ? formatRupiah(car.sale.harga_jual_realisasi)
                    : formatRupiah(car.harga_jual_target)}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-slate-500 block">
                  {car.status === 'terjual' ? 'Keuntungan Realisasi:' : 'Estimasi Laba Bersih:'}
                </span>
                <span className="text-xl font-bold text-emerald-600 mt-0.5 flex items-center sm:justify-end gap-1.5">
                  <TrendingUp className="w-5 h-5" />
                  {car.status === 'terjual' && car.sale?.keuntungan
                    ? formatRupiah(car.sale.keuntungan)
                    : formatRupiah(estimasiUntung)}
                </span>
              </div>
            </div>
          </div>

          {/* Jika Unit Terjual: Data Pembeli */}
          {car.sale && (
            <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Informasi Pembeli & Transaksi
                </h3>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Terjual • {formatDate(car.sale.tanggal_terjual)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Nama Pembeli:
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {car.sale.nama_pembeli}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> No. Telepon:
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {car.sale.no_telepon}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" /> Pembayaran:
                  </span>
                  <span className="font-semibold text-slate-900 uppercase">
                    {car.sale.metode_pembayaran}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> NIK KTP:
                  </span>
                  <span className="font-medium text-slate-900">
                    {car.sale.nik_ktp || '-'}
                  </span>
                </div>
              </div>

              {car.sale.alamat_pembeli && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> Alamat:
                  </span>
                  <span className="text-slate-800 font-medium">
                    {car.sale.alamat_pembeli}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Rincian Perbaikan / Servis */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                Catatan Biaya Perbaikan ({car.repairs?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setIsRepairModalOpen(true)}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
              >
                + Tambah Perbaikan
              </button>
            </div>

            {car.repairs && car.repairs.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Tanggal</th>
                      <th className="py-2.5 px-3 font-medium">Item Perbaikan</th>
                      <th className="py-2.5 px-3 font-medium">Catatan Bengkel</th>
                      <th className="py-2.5 px-3 text-right font-medium">Biaya (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {car.repairs.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(r.tanggal)}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{r.nama_perbaikan}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.bengkel_catatan || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                          {formatRupiah(r.biaya)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                Tidak ada biaya perbaikan untuk unit ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CarRepairModal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        car={car}
        onRepairUpdated={fetchCarDetail}
      />

      <SellCarModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        car={car}
        onSubmit={handleSellSubmit}
        isLoading={isSubmittingSale}
      />
    </div>
  );
}
