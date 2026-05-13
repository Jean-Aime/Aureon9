import React, { createContext, useContext, useState, useCallback } from 'react';
import { HiCheckCircle, HiXCircle, HiExclamation, HiInformationCircle, HiX } from 'react-icons/hi';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    warning: (message, duration) => addToast(message, 'warning', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ id, message, type, onClose }) {
  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      icon: HiCheckCircle,
      iconColor: 'text-emerald-600',
    },
    error: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-800',
      icon: HiXCircle,
      iconColor: 'text-rose-600',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-800',
      icon: HiExclamation,
      iconColor: 'text-amber-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: HiInformationCircle,
      iconColor: 'text-blue-600',
    },
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${style.bg} px-4 py-3 shadow-lg backdrop-blur-sm animate-slide-in-right min-w-[320px] max-w-md`}
    >
      <Icon className={`h-5 w-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm font-medium ${style.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${style.text} hover:opacity-70 transition-opacity`}
        aria-label="Close"
      >
        <HiX className="h-4 w-4" />
      </button>
    </div>
  );
}
