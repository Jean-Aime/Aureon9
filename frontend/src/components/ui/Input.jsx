export function Input({ className = '', ...props }) {
  return (
    <input
      className={`rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-500 focus:border-[#0A2540] focus:outline-none focus:ring-1 focus:ring-[#0A2540] ${className}`}
      {...props}
    />
  );
}
