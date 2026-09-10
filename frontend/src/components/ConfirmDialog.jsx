import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
  variant = 'danger',
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl p-5 z-10">
        <div className="flex items-start gap-3.5">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            variant === 'danger' 
              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
              : 'bg-amber-50 text-amber-600 border border-amber-100'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-900">
              {title}
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition active:scale-95 disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
