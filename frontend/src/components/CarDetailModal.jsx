import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { formatRupiah, formatDate, getStatusBadge, getFileUrl } from '../utils/formatters';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { 
  Truck, 
  Wrench, 
  ShoppingBag, 
  Edit, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function CarDetailModal({
  isOpen,
  onClose,
  car,
  onOpenRepair,
  onOpenSell,
  onOpenEdit,
}) {
  const [repairs, setRepairs] = useState([]);
  const [isLoadingRepairs, setIsLoadingRepairs] = useState(false);
  const [isRepairsExpanded, setIsRepairsExpanded] = useState(true);

  useEffect(() => {
    if (isOpen && car?.id) {
      if (car.repairs && Array.isArray(car.repairs)) {
        setRepairs(car.repairs);
      } else {
        fetchRepairs(car.id);
      }
    } else {
      setRepairs([]);
    }
  }, [isOpen, car]);

  const fetchRepairs = async (carId) => {
    try {
      setIsLoadingRepairs(true);
      const res = await request.get(API_ENDPOINTS.REPAIRS.LIST_BY_CAR(carId));
      if (res.success) {
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.repairs || []);
        setRepairs(list);
      }
    } catch (err) {
      // Silently catch error on preview modal
    } finally {
      setIsLoadingRepairs(false);
    }
  };

  if (!car) return null;

  const badge = getStatusBadge(car.status);
  const totalPerbaikan = repairs.length > 0 
    ? repairs.reduce((acc, r) => acc + parseFloat(r.biaya || 0), 0)
    : Number(car.total_perbaikan || 0);

  const totalModal = Number(car.harga_beli || 0) + totalPerbaikan;
  const estimasiLaba = Number(car.estimasi_keuntungan || (car.harga_jual_target - totalModal));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${car.plat_nomor} • ${car.merk} ${car.model}`}
      subtitle={`Tahun ${car.tahun}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-xs">
        {/* Foto Unit */}
        {car.foto_utama && (
          <div className="w-full h-44 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
            <img
              src={getFileUrl(car.foto_utama)}
              alt={car.model}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Status Badge */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Status Unit:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>
        </div>

        {/* Finansial Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">
            Rincian Finansial Unit
          </span>
          <div className="flex justify-between text-slate-600">
            <span>Harga Beli Modal:</span>
            <span className="font-semibold text-slate-800">{formatRupiah(car.harga_beli)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Biaya Perbaikan / Rekondisi:</span>
            <span className="font-semibold text-amber-700">
              +{formatRupiah(totalPerbaikan)}
            </span>
          </div>
          <div className="flex justify-between text-slate-900 pt-1.5 border-t border-slate-200 font-bold">
            <span>Total Modal Pokok:</span>
            <span>{formatRupiah(totalModal)}</span>
          </div>
          <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200">
            <span className="font-medium text-slate-600">
              {car.status === 'terjual' ? 'Harga Jual Realisasi:' : 'Target Harga Jual:'}
            </span>
            <span className="font-bold">
              {formatRupiah(car.harga_jual_realisasi || car.harga_jual_target)}
            </span>
          </div>
          <div className="flex justify-between text-emerald-700 pt-1 border-t border-slate-200 font-bold">
            <span>{car.status === 'terjual' ? 'Laba Realisasi:' : 'Estimasi Laba:'}</span>
            <span>
              {formatRupiah(car.keuntungan_realisasi || estimasiLaba)}
            </span>
          </div>
        </div>

        {/* Rincian Pengeluaran Unit (Detail Breakdown) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-semibold text-slate-900 text-xs">
                Rincian Pengeluaran / Perbaikan ({repairs.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenRepair) onOpenRepair(car);
                }}
                className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md border border-amber-300 transition"
              >
                + Kelola / Koreksi
              </button>
              <button
                type="button"
                onClick={() => setIsRepairsExpanded(!isRepairsExpanded)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
                aria-label="Toggle rincian pengeluaran"
              >
                {isRepairsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRepairsExpanded && (
            <div className="p-3">
              {isLoadingRepairs ? (
                <div className="py-4 text-center text-slate-400">Memuat rincian pengeluaran...</div>
              ) : repairs.length === 0 ? (
                <div className="text-center py-4 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  <p>Belum ada catatan biaya perbaikan untuk unit ini.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenRepair) onOpenRepair(car);
                    }}
                    className="mt-2 text-xs font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
                  >
                    + Catat Pengeluaran Pertama
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {repairs.map((r) => (
                    <div key={r.id} className="py-2 flex items-center justify-between gap-2 hover:bg-slate-50/50 px-1 rounded transition">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">
                            {r.nama_perbaikan}
                          </span>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatDate(r.tanggal)}
                          </span>
                        </div>
                        {r.bengkel_catatan && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Bengkel / Catatan: {r.bengkel_catatan}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-amber-700 whitespace-nowrap text-xs">
                        +{formatRupiah(r.biaya)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spesifikasi Grid */}
        <div className="grid grid-cols-2 gap-2 text-slate-600 bg-white border border-slate-200 rounded-xl p-3">
          <div>
            <span className="text-slate-400 block text-[10px]">Warna</span>
            <span className="font-medium text-slate-800">{car.warna || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Kilometer</span>
            <span className="font-medium text-slate-800">
              {car.kilometer ? `${car.kilometer.toLocaleString()} km` : '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Bahan Bakar</span>
            <span className="font-medium text-slate-800">{car.bahan_bakar || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Transmisi</span>
            <span className="font-medium text-slate-800">{car.transmisi || '-'}</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 block text-[10px]">Tanggal Masuk</span>
            <span className="font-medium text-slate-800">{formatDate(car.tanggal_masuk)}</span>
          </div>
        </div>

        {/* Catatan Kondisi */}
        {car.deskripsi_kondisi && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-medium mb-0.5">Catatan Unit:</span>
            <p className="text-slate-700 leading-relaxed">{car.deskripsi_kondisi}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenRepair) onOpenRepair(car);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold transition"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Koreksi & Biaya Perbaikan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenEdit) onOpenEdit(car);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition"
          >
            <Edit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Unit</span>
          </button>

          {car.status !== 'terjual' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenSell) onOpenSell(car);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Jual Mobil</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
