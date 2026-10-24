import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

interface ToastType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

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

  const getStyles = (type: string) => {
    const styles = {
      success: { icon: CheckCircle2, bg: 'bg-green-50 border-green-200', text: 'text-green-800', progress: 'bg-green-500' },
      error: { icon: XCircle, bg: 'bg-red-50 border-red-200', text: 'text-red-800', progress: 'bg-red-500' },
      warning: { icon: AlertTriangle, bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', progress: 'bg-yellow-500' },
      info: { icon: Info, bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', progress: 'bg-blue-500' },
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  const style = getStyles(toast.type);
  const Icon = style.icon;

  return (
    <div className={`transform transition-all duration-300 ease-in-out ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}>
      <div className={`border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md ${style.bg}`}>
        <div className="flex items-start gap-3">
          <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            {toast.title && <h4 className={`font-semibold ${style.text}`}>{toast.title}</h4>}
            <p className={`text-sm ${style.text}`}>{toast.message}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" aria-label="Fechar notificação"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${style.progress} transition-all duration-1000 ease-linear`} style={{ width: '100%' }} onAnimationEnd={handleClose} />
        </div>
      </div>
    </div>
  );
};

export default Toast;