import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext<{
  show: (msg: string, type?: 'success' | 'error') => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [fade, setFade] = useState<'in' | 'out'>('in');

  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setFade('in');
    setTimeout(() => setFade('out'), 1700); // Start fade out before remove
    setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div
          className={`fixed left-1/2 top-6 z-[9999] -translate-x-1/2 flex items-center gap-2 rounded-md border px-4 py-2 text-sm shadow-lg
            ${toast.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}
            ${fade === 'in' ? 'toast-fade-in' : 'toast-fade-out'}`}
          style={{
            animation: `${fade === 'in' ? 'toast-fade-in' : 'toast-fade-out'} 0.3s both`
          }}
        >
          {toast.type === 'success' ? (
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          ) : (
            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
