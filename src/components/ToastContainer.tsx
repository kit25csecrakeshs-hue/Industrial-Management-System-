import React from 'react';
import { useIndustrial } from '../context/IndustrialContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useIndustrial();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 border-slate-700 text-white';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          bgStyle = 'bg-slate-900 border-emerald-500/50 text-white';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-slate-900 border-amber-500/50 text-white';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-slate-900 border-red-500/50 text-white';
          icon = <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all ${bgStyle}`}
            role="alert"
          >
            {icon}
            <div className="flex-1 text-xs font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
