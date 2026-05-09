import React from 'react';

const PrimaryButton = ({ children, ...props }) => (
  <button
    className="mt-4 w-full rounded-xl bg-white px-4 py-4 text-lg font-extrabold text-slate-950 transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-white/50"
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
