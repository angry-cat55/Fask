import React from 'react';

const TextInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = true,
  autoComplete,
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
      className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-4 text-base text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-300/70 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-300/20"
      {...props}
    />
  </label>
);

export default TextInput;
