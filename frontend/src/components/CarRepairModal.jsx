import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import ConfirmDialog from './ConfirmDialog';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { formatRupiah, formatDate } from '../utils/formatters';
import { Wrench, Plus, Trash2, Edit2, Check, X, RotateCcw } from 'lucide-react';
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

  // Form State
  const [editingRepairId, setEditingRepairId] = useState(null);
  const [namaPerbaikan, setNamaPerbaikan] = useState('');
  const [biaya, setBiaya] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [bengkelCatatan, setBengkelCatatan] = useState('');

  // Delete Confirm Dialog State
  const [repairToDelete, setRepairToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.repairs || []);
        const total = typeof res.data?.total_biaya === 'number'
          ? res.data.total_biaya
          : list.reduce((sum, item) => sum + parseFloat(item.biaya || 0), 0);
        setRepairs(list);
        setTotalBiaya(total);
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
      handleCancelEdit();
    }
  }, [isOpen, car]);

  const handleStartEdit = (repair) => {
    setEditingRepairId(repair.id);
    setNamaPerbaikan(repair.nama_perbaikan || '');
    setBiaya(repair.biaya ? String(parseInt(repair.biaya, 10)) : '');
    setTanggal(repair.tanggal ? String(repair.tanggal).split('T')[0] : new Date().toISOString().split('T')[0]);
    setBengkelCatatan(repair.bengkel_catatan || '');
  };

  const handleCancelEdit = () => {
    setEditingRepairId(null);
    setNamaPerbaikan('');
    setBiaya('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setBengkelCatatan('');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!namaPerbaikan.trim()) {
      toast.error('Nama perbaikan / pengeluaran wajib diisi');
      return;
    }
    if (!biaya || Number(biaya) <= 0) {
      toast.error('Biaya harus lebih dari 0');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingRepairId) {
        // Mode Koreksi / Edit
        const res = await request.put(API_ENDPOINTS.REPAIRS.UPDATE(editingRepairId), {
          nama_perbaikan: namaPerbaikan.trim(),
          biaya: parseFloat(biaya),
          tanggal,
          bengkel_catatan: bengkelCatatan.trim(),
        });

        if (res.success) {
          toast.success('Biaya pengeluaran berhasil dikoreksi!');
          handleCancelEdit();
          fetchRepairs();
          if (onRepairUpdated) onRepairUpdated();
        }
      } else {
        // Mode Tambah Baru
        const res = await request.post(API_ENDPOINTS.REPAIRS.CREATE(car.id), {
          nama_perbaikan: namaPerbaikan.trim(),
          biaya: parseFloat(biaya),
          tanggal,
          bengkel_catatan: bengkelCatatan.trim(),
        });

        if (res.success) {
          toast.success('Biaya perbaikan berhasil dicatat');
          handleCancelEdit();
          fetchRepairs();
          if (onRepairUpdated) onRepairUpdated();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data perbaikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!repairToDelete) return;
    try {
      setIsDeleting(true);
      const res = await request.delete(API_ENDPOINTS.REPAIRS.DELETE(repairToDelete.id));
      if (res.success) {
        toast.success('Item pengeluaran perbaikan berhasil dihapus');
        setRepairToDelete(null);
        if (editingRepairId === repairToDelete.id) {
          handleCancelEdit();
        }
        fetchRepairs();
        if (onRepairUpdated) onRepairUpdated();
      }
    } catch (err) {
      toast.error('Gagal menghapus item perbaikan');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalModalSaatIni = Number(car?.harga_beli || 0) + Number(totalBiaya);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Biaya Perbaikan / Pengeluaran Unit"
        subtitle={`${car?.plat_nomor || ''} • ${car?.merk || ''} ${car?.model || ''}`}
        maxWidth="max-w-2xl"
        isLoading={isLoading}
      >
        <div className="space-y-4 text-xs">
          {/* Ringkasan Modal Finansial */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">Harga Beli Unit</span>
              <span className="font-semibold text-slate-800">{formatRupiah(car?.harga_beli)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Pengeluaran</span>
              <span className="font-semibold text-amber-700">+{formatRupiah(totalBiaya)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Modal Pokok</span>
              <span className="font-bold text-slate-900">{formatRupiah(totalModalSaatIni)}</span>
            </div>
          </div>

          {/* Form Tambah / Koreksi Pengeluaran */}
          <form 
            onSubmit={handleSubmitForm} 
            className={`border rounded-xl p-3.5 space-y-3 transition-colors ${
              editingRepairId 
                ? 'bg-amber-50/50 border-amber-300' 
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 block text-xs">
                  {editingRepairId ? 'Koreksi Data Pengeluaran' : 'Tambah Pengeluaran / Perbaikan'}
                </span>
                {editingRepairId && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-200 text-amber-900 border border-amber-300">
                    <Edit2 className="w-2.5 h-2.5" />
                    Mode Koreksi
                  </span>
                )}
              </div>

              {editingRepairId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                >
                  <X className="w-3 h-3" />
                  Batal
                </button>
              )}
            </div>

            {/* Quick Presets (hanya muncul saat mode tambah baru) */}
            {!editingRepairId && (
              <div className="flex flex-wrap gap-1">
                {repairPresets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setNamaPerbaikan(p.nama);
                      setBiaya(p.biaya);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-[11px] transition"
                  >
                    + {p.nama}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Item Perbaikan / Pengeluaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaPerbaikan}
                  onChange={(e) => setNamaPerbaikan(e.target.value)}
                  placeholder="Ganti Ban / Servis Rem"
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Biaya (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={biaya}
                  onChange={(e) => setBiaya(e.target.value)}
                  placeholder="500000"
                  required
                  min="1"
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
                placeholder="Bengkel Ciamis / Toko Ban Berkah"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {editingRepairId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition active:scale-95 disabled:opacity-50 ${
                  editingRepairId
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {editingRepairId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Simpan Koreksi</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Simpan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Tabel Riwayat Perbaikan */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 block">
                Riwayat Pengeluaran Perbaikan ({repairs.length})
              </span>
              {repairs.length > 0 && (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Total: {formatRupiah(totalBiaya)}
                </span>
              )}
            </div>

            {repairs.length === 0 ? (
              <p className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-lg text-xs">
                Belum ada biaya perbaikan untuk unit ini.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 font-medium">Tanggal</th>
                      <th className="py-2.5 px-3 font-medium">Item Pengeluaran</th>
                      <th className="py-2.5 px-3 font-medium">Catatan / Bengkel</th>
                      <th className="py-2.5 px-3 text-right font-medium">Biaya</th>
                      <th className="py-2.5 px-3 text-center font-medium w-28">Koreksi & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {repairs.map((r) => {
                      const isCurrentEditing = editingRepairId === r.id;
                      return (
                        <tr 
                          key={r.id} 
                          className={`transition ${
                            isCurrentEditing 
                              ? 'bg-amber-50/80 font-medium' 
                              : 'hover:bg-slate-50/60'
                          }`}
                        >
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {formatDate(r.tanggal)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-900 font-medium">
                            {r.nama_perbaikan}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {r.bengkel_catatan || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-amber-700 whitespace-nowrap">
                            {formatRupiah(r.biaya)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              {/* Tombol Koreksi / Edit */}
                              <button
                                type="button"
                                onClick={() => handleStartEdit(r)}
                                className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition ${
                                  isCurrentEditing
                                    ? 'bg-amber-600 text-white'
                                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                }`}
                                title="Koreksi / Ubah Data Pengeluaran Ini"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Koreksi</span>
                              </button>

                              {/* Tombol Hapus */}
                              <button
                                type="button"
                                onClick={() => setRepairToDelete(r)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                                title="Hapus Data Pengeluaran"
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

      {/* Confirm Dialog Hapus Item Pengeluaran */}
      <ConfirmDialog
        isOpen={Boolean(repairToDelete)}
        onClose={() => setRepairToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Item Pengeluaran"
        message={`Apakah Anda yakin ingin menghapus catatan "${repairToDelete?.nama_perbaikan}" sebesar ${formatRupiah(repairToDelete?.biaya)}? Tindakan ini akan mengurangi total modal pokok unit.`}
        confirmText="Hapus Pengeluaran"
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
