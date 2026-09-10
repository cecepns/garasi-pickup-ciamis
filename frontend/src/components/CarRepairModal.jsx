import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CarRepairModal({
  isOpen,
  onClose,
  car,
  onRepairUpdated,
}) {
  const [repairs, setRepairs] = useState([]);
  const [totalBiaya, setTotalBiaya] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form input item baru
  const [namaPerbaikan, setNamaPerbaikan] = useState('');
  const [biaya, setBiaya] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [bengkelCatatan, setBengkelCatatan] = useState('');

  const repairPresets = [
    { nama: 'Ganti Oli + Filter', biaya: 450000 },
    { nama: 'Tune-up & Servis Rem', biaya: 500000 },
    { nama: 'Cat Ulang Bak', biaya: 1500000 },
    { nama: 'Ganti Ban Baru', biaya: 1300000 },
  ];

  const fetchRepairs = async () => {
    if (!car?.id) return;
    try {
      setIsLoading(true);
      const res = await request.get(API_ENDPOINTS.REPAIRS.LIST_BY_CAR(car.id));
      if (res.success) {
        setRepairs(res.data.repairs || []);
        setTotalBiaya(res.data.total_biaya || 0);
      }
    } catch (err) {
      toast.error('Gagal mengambil data perbaikan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && car?.id) {
      fetchRepairs();
      setNamaPerbaikan('');
      setBiaya('');
      setBengkelCatatan('');
    }
  }, [isOpen, car]);

  const handleAddRepair = async (e) => {
    e.preventDefault();
    if (!namaPerbaikan.trim()) {
      toast.error('Nama perbaikan wajib diisi');
      return;
    }
    if (!biaya || Number(biaya) <= 0) {
      toast.error('Biaya harus lebih dari 0');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await request.post(API_ENDPOINTS.REPAIRS.CREATE(car.id), {
        nama_perbaikan: namaPerbaikan.trim(),
        biaya: parseFloat(biaya),
        tanggal,
        bengkel_catatan: bengkelCatatan.trim(),
      });

      if (res.success) {
        toast.success('Biaya perbaikan dicatat');
        setNamaPerbaikan('');
        setBiaya('');
        setBengkelCatatan('');
        fetchRepairs();
        if (onRepairUpdated) onRepairUpdated();
      }
    } catch (err) {
      toast.error('Gagal menambah perbaikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRepair = async (id) => {
    if (!window.confirm('Hapus item perbaikan ini?')) return;

    try {
      const res = await request.delete(API_ENDPOINTS.REPAIRS.DELETE(id));
      if (res.success) {
        toast.success('Item dihapus');
        fetchRepairs();
        if (onRepairUpdated) onRepairUpdated();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const totalModalSaatIni = Number(car?.harga_beli || 0) + Number(totalBiaya);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Biaya Perbaikan"
      subtitle={`${car?.plat_nomor || ''} • ${car?.merk || ''} ${car?.model || ''}`}
      maxWidth="max-w-2xl"
      isLoading={isLoading}
    >
      <div className="space-y-4 text-xs">
        {/* Ringkasan Modal */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-slate-400 block text-[10px]">Harga Beli</span>
            <span className="font-semibold text-slate-800">{formatRupiah(car?.harga_beli)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Perbaikan</span>
            <span className="font-semibold text-amber-700">+{formatRupiah(totalBiaya)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Total Modal</span>
            <span className="font-bold text-slate-900">{formatRupiah(totalModalSaatIni)}</span>
          </div>
        </div>

        {/* Form Tambah */}
        <form onSubmit={handleAddRepair} className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3">
          <span className="font-semibold text-slate-900 block text-xs">Tambah Perbaikan</span>

          <div className="flex flex-wrap gap-1">
            {repairPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNamaPerbaikan(p.nama);
                  setBiaya(p.biaya);
                }}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px]"
              >
                + {p.nama}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Item Perbaikan</label>
              <input
                type="text"
                value={namaPerbaikan}
                onChange={(e) => setNamaPerbaikan(e.target.value)}
                placeholder="Ganti Ban"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Biaya (Rp)</label>
              <input
                type="number"
                value={biaya}
                onChange={(e) => setBiaya(e.target.value)}
                placeholder="500000"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 font-medium outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Catatan / Bengkel</label>
            <input
              type="text"
              value={bengkelCatatan}
              onChange={(e) => setBengkelCatatan(e.target.value)}
              placeholder="Bengkel Ciamis"
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </form>

        {/* Tabel Riwayat */}
        <div>
          <span className="font-semibold text-slate-700 block mb-2">Riwayat Perbaikan ({repairs.length})</span>
          {repairs.length === 0 ? (
            <p className="text-center py-4 text-slate-400 border border-dashed border-slate-200 rounded-lg">
              Belum ada biaya perbaikan.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Catatan</th>
                    <th className="py-2 px-3 text-right">Biaya</th>
                    <th className="py-2 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {repairs.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-500">{formatDate(r.tanggal)}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{r.nama_perbaikan}</td>
                      <td className="py-2 px-3 text-slate-500">{r.bengkel_catatan || '-'}</td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-700">{formatRupiah(r.biaya)}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRepair(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
}
