import { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, children, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors',
          error
            ? 'border-red-400 dark:border-red-500'
            : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Select.displayName = 'Select';
