import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export function EmptyState({
  title = 'Tidak ada data ditemukan',
  description = 'Belum ada data yang sesuai dengan kriteria.',
  actionText,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl bg-white border border-slate-200 my-2">
      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ type = 'table', rows = 4 }) {
  return (
    <div className="w-full space-y-2 p-4 bg-white rounded-2xl border border-slate-200 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-lg mb-3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-50 rounded-lg" />
      ))}
    </div>
  );
}

export default EmptyState;
