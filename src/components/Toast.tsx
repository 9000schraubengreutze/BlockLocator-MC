import React from 'react';
import { CheckCircle2, Copy } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-900/95 border border-emerald-500/40 text-slate-100 rounded-xl shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
        {type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-100">{message}</p>
      </div>
    </div>
  );
};
