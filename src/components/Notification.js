'use client';

import { useEffect } from 'react';

export default function Notification({ show, message, type = 'success', onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      if (onClose) onClose();
    }, 4000);
    return () => clearTimeout(t);
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === 'success';
  return (
    <div
      className={`fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-lg px-6 py-3 shadow-lg transition-all duration-300 ${
        isSuccess ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <span className="font-medium">{message}</span>
    </div>
  );
}
