import React, { useEffect, useState } from 'react';
import type { Toast as ToastType } from '@/contexts/ToastContext';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  };

  const progressColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className={`border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md ${bgColors[toast.type]}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">{icons[toast.type]}</div>
          
          <div className="flex-1">
            {toast.title && (
              <h4 className={`font-semibold ${textColors[toast.type]}`}>
                {toast.title}
              </h4>
            )}
            <p className={`text-sm ${textColors[toast.type]}`}>
              {toast.message}
            </p>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColors[toast.type]} transition-all duration-1000 ease-linear`}
            style={{ width: '100%' }}
            onAnimationEnd={handleClose}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;