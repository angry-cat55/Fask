import React from 'react';

const TextInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = true,
  autoComplete,
  error,
  ...props
}) => (
  <label className="flex flex-col gap-2 text-sm text-slate-200">
    {label && <span className="font-medium text-slate-100">{label}</span>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      className={`w-full rounded-xl border bg-slate-900/70 px-4 py-4 text-base text-white placeholder:text-slate-400 outline-none transition focus:bg-slate-900 focus:ring-2 ${
        error
          ? 'border-red-400/70 focus:border-red-300/70 focus:ring-red-300/20'
          : 'border-white/10 focus:border-cyan-300/70 focus:ring-cyan-300/20'
      }`}
      {...props}
    />
    {error && <span className="text-sm text-red-400">{error}</span>}
  </label>
);

export default TextInput;
