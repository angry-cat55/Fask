import React from 'react';

const PERIOD_OPTIONS = [
  { label: '10분', value: 10 },
  { label: '20분', value: 20 },
  { label: '30분', value: 30 },
  { label: '40분', value: 40 },
  { label: '50분', value: 50 },
  { label: '1시간', value: 60 },
  { label: '2시간', value: 120 },
  { label: '3시간', value: 180 },
  { label: '4시간', value: 240 },
  { label: '6시간', value: 360 },
  { label: '8시간', value: 480 },
  { label: '12시간', value: 720 },
  { label: '24시간', value: 1440 },
];

const PeriodSelect = ({ value, onChange, className = '', disabled = false }) => {
  const matched = PERIOD_OPTIONS.some(
    (opt) => String(opt.value) === String(value),
  );
  const effectiveValue = matched
    ? String(value)
    : String(PERIOD_OPTIONS[0].value);

  return (
    <select
      value={effectiveValue}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={`w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500 transition ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
    >
      {PERIOD_OPTIONS.map((opt) => (
        <option key={opt.value} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default PeriodSelect;
