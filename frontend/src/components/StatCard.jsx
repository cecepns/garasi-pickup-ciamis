import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badgeText = null,
}) {
  const themeConfig = {
    blue: {
      card: 'bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white border-blue-200/80 shadow-xs hover:shadow-md hover:border-blue-300',
      iconBox: 'bg-blue-600 text-white shadow-xs shadow-blue-500/25',
      title: 'text-blue-900',
      value: 'text-blue-950',
      subtitle: 'text-blue-700/80',
      badge: 'bg-blue-100/80 text-blue-700 border-blue-200',
    },
    purple: {
      card: 'bg-gradient-to-br from-purple-50/90 via-fuchsia-50/40 to-white border-purple-200/80 shadow-xs hover:shadow-md hover:border-purple-300',
      iconBox: 'bg-purple-600 text-white shadow-xs shadow-purple-500/25',
      title: 'text-purple-900',
      value: 'text-purple-950',
      subtitle: 'text-purple-700/80',
      badge: 'bg-purple-100/80 text-purple-700 border-purple-200',
    },
    amber: {
      card: 'bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white border-amber-200/80 shadow-xs hover:shadow-md hover:border-amber-300',
      iconBox: 'bg-amber-600 text-white shadow-xs shadow-amber-500/25',
      title: 'text-amber-950',
      value: 'text-amber-950',
      subtitle: 'text-amber-800/80',
      badge: 'bg-amber-100/80 text-amber-800 border-amber-200',
    },
    emerald: {
      card: 'bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-300',
      iconBox: 'bg-emerald-600 text-white shadow-xs shadow-emerald-500/25',
      title: 'text-emerald-950',
      value: 'text-emerald-950 font-extrabold',
      subtitle: 'text-emerald-800/80',
      badge: 'bg-emerald-100/80 text-emerald-800 border-emerald-200',
    },
    orange: {
      card: 'bg-gradient-to-br from-orange-50/90 via-rose-50/40 to-white border-orange-200/80 shadow-xs hover:shadow-md hover:border-orange-300',
      iconBox: 'bg-orange-600 text-white shadow-xs shadow-orange-500/25',
      title: 'text-orange-950',
      value: 'text-orange-950',
      subtitle: 'text-orange-800/80',
      badge: 'bg-orange-100/80 text-orange-800 border-orange-200',
    },
    slate: {
      card: 'bg-white border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300',
      iconBox: 'bg-slate-800 text-white',
      title: 'text-slate-600',
      value: 'text-slate-900',
      subtitle: 'text-slate-500',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  const theme = themeConfig[color] || themeConfig.blue;

  // Ukuran font adaptif agar nominal Rupiah panjang tidak terpotong (truncate)
  const isLongValue = typeof value === 'string' && value.length > 10;
  const isVeryLongValue = typeof value === 'string' && value.length > 15;

  const valueFontSize = isVeryLongValue
    ? 'text-base sm:text-lg font-bold'
    : isLongValue
    ? 'text-lg sm:text-[19px] xl:text-xl font-bold'
    : 'text-xl sm:text-2xl font-bold';

  return (
    <div className={`p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${theme.card}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className={`text-[11px] font-bold tracking-wider block uppercase ${theme.title}`}>
            {title}
          </span>
          <h3 className={`${valueFontSize} mt-1 tracking-tight leading-snug whitespace-nowrap overflow-visible ${theme.value}`}>
            {value}
          </h3>
        </div>

        <div className={`p-2 rounded-xl flex-shrink-0 ${theme.iconBox}`}>
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] gap-1.5">
        <span className={`font-medium truncate ${theme.subtitle}`}>
          {subtitle || '-'}
        </span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${theme.badge}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
