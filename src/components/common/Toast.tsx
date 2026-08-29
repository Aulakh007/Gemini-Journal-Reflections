import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { ToastMessage } from '../../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      case 'info': return <Info className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
    }
  };

  return (
    <div className="pointer-events-auto p-3.5 rounded-2xl bg-white dark:bg-[#1C1C1F] border border-stone-200/80 dark:border-zinc-800 shadow-lg flex items-start gap-3 animate-in slide-in-from-bottom-2 fade-in duration-150">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
