export function Alert({ className, variant = 'default', children, ...props }) {
  const baseStyles = 'rounded-lg border px-4 py-3';
  const variantStyles = {
    default: 'border-slate-200 bg-slate-50 text-slate-900',
    destructive: 'border-red-200 bg-red-50 text-red-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function AlertDescription({ className, children, ...props }) {
  return (
    <p className={`text-sm ${className}`} {...props}>
      {children}
    </p>
  );
}
