'use client';

import { useState, useEffect, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const toasts: Toast[] = [];
let listeners: Set<() => void> = new Set();

const addToast = (message: string, type: ToastType = 'success') => {
  const id = `toast-${toastId++}`;
  const toast: Toast = { id, message, type };
  toasts.push(toast);
  
  // Notify all listeners
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
    
    listeners.add(updateToasts);
    updateToasts();
    
    return () => {
      listeners.delete(updateToasts);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener());
    }
  }, []);

  if (toastList.length === 0) return null;

  return (
    <div 
      className="fixed space-y-2 pointer-events-none" 
      style={{ 
        top: '20px',
        right: '20px',
        zIndex: 99999,
        maxWidth: 'calc(100vw - 40px)',
        position: 'fixed',
        pointerEvents: 'none'
      }}
    >
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`toast-slide-in pointer-events-auto min-w-[300px] max-w-md px-4 py-3 rounded-lg shadow-2xl backdrop-blur-xl border-2 transition-all duration-300 cursor-pointer ${
            toast.type === 'success'
              ? 'bg-green-600 border-green-400 text-white'
              : toast.type === 'error'
              ? 'bg-red-600 border-red-400 text-white'
              : 'bg-blue-600 border-blue-400 text-white'
          }`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-lg font-bold">
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
              className="flex-shrink-0 text-white/70 hover:text-white transition text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
