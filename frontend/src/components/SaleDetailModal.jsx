import React from 'react';
import Modal from './Modal';
import { formatRupiah, formatDate } from '../utils/formatters';
import { User, Phone, MapPin, CreditCard, FileText, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SaleDetailModal({ isOpen, onClose, sale }) {
  if (!sale) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Transaksi Penjualan"
      subtitle={`${sale.plat_nomor || ''} • ${sale.merk || ''} ${sale.model || ''}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 text-xs">
        {/* Unit & Tanggal Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="font-bold text-slate-900 text-sm block">
              {sale.plat_nomor}
            </span>
            <span className="text-slate-500">
              {sale.merk} {sale.model} ({sale.tahun})
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Terjual: {formatDate(sale.tanggal_terjual)}
          </span>
        </div>

        {/* Keuangan Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">
            Kalkulasi Laba
          </span>
          <div className="flex justify-between text-slate-600">
            <span>Harga Beli Modal:</span>
            <span className="font-semibold text-slate-800">{formatRupiah(sale.harga_beli)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Biaya Perbaikan:</span>
            <span className="font-semibold text-amber-700">
              +{formatRupiah(sale.total_perbaikan || 0)}
            </span>
          </div>
          <div className="flex justify-between text-slate-900 pt-1.5 border-t border-slate-200 font-bold">
            <span>Total Modal Pokok:</span>
            <span>{formatRupiah(sale.total_biaya_modal)}</span>
          </div>
          <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200 font-bold">
            <span>Harga Jual Realisasi:</span>
            <span>{formatRupiah(sale.harga_jual_realisasi)}</span>
          </div>
          <div className="flex justify-between text-emerald-700 pt-1 border-t border-slate-200 font-bold text-sm">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 inline" /> Keuntungan Bersih:
            </span>
            <span>{formatRupiah(sale.keuntungan)}</span>
          </div>
        </div>

        {/* Data Pembeli Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5">
          <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">
            Data Pembeli
          </span>
          <div className="grid grid-cols-2 gap-3 text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Nama Pembeli</span>
              <span className="font-bold text-slate-900 text-xs">{sale.nama_pembeli}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">No. Telepon / WA</span>
              <span className="font-medium text-slate-800">{sale.no_telepon}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Metode Pembayaran</span>
              <span className="font-semibold text-slate-800 uppercase">{sale.metode_pembayaran}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">NIK KTP</span>
              <span className="font-medium text-slate-800">{sale.nik_ktp || '-'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block text-[10px]">Alamat Domisili</span>
              <span className="font-medium text-slate-800">{sale.alamat_pembeli}</span>
            </div>
          </div>
        </div>

        {/* Catatan Serah Terima */}
        {sale.catatan_penjualan && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-slate-400 block text-[10px] font-medium mb-0.5">Catatan Penjualan:</span>
            <p className="text-slate-700 leading-relaxed">{sale.catatan_penjualan}</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
