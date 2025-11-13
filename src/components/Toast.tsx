'use client';

import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: Array<() => void> = [];

const addToast = (message: string, type: ToastType = 'success') => {
  const id = `toast-${toastId++}`;
  toasts.push({ id, message, type });
  listeners.forEach(listener => listener());
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener());
    }
  }, 3000);
};

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  info: (message: string) => addToast(message, 'info'),
};

export default function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const updateToasts = () => {
      setToastList([...toasts]);
    };
    
    listeners.push(updateToasts);
    updateToasts();
    
    return () => {
      const index = listeners.indexOf(updateToasts);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener());
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-lg backdrop-blur-xl border transition-all duration-300 animate-in slide-in-from-right ${
            toast.type === 'success'
              ? 'bg-green-900/90 border-green-500/50 text-white'
              : toast.type === 'error'
              ? 'bg-red-900/90 border-red-500/50 text-white'
              : 'bg-blue-900/90 border-blue-500/50 text-white'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'ℹ'}
            </div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="flex-shrink-0 text-white/70 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

