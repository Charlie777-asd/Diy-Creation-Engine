import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const toastQueue = [];
let setToastsExternal = null;

export function showToast(message, type = 'success', duration = 3500) {
  const id = Date.now() + Math.random();
  const toast = { id, message, type, duration };
  if (setToastsExternal) {
    setToastsExternal(prev => [...prev, toast]);
    setTimeout(() => {
      if (setToastsExternal) setToastsExternal(prev => prev.filter(t => t.id !== id));
    }, duration + 500);
  } else {
    toastQueue.push(toast);
  }
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLORS = {
  success: { bg: 'rgba(22,101,52,0.95)', border: '#16a34a', icon: '#4ade80', text: '#dcfce7' },
  error: { bg: 'rgba(127,29,29,0.95)', border: '#dc2626', icon: '#f87171', text: '#fee2e2' },
  info: { bg: 'rgba(30,58,138,0.95)', border: '#2563eb', icon: '#93c5fd', text: '#dbeafe' },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[toast.type] || CheckCircle;
  const colors = COLORS[toast.type] || COLORS.success;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setVisible(false); setTimeout(onRemove, 400); }, toast.duration || 3500);
    return () => clearTimeout(t);
  }, [toast.duration, onRemove]);

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl shadow-2xl min-w-[280px] max-w-[380px] cursor-pointer"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(16px)',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: `0 20px 40px rgba(0,0,0,0.5), 0 0 20px ${colors.border}30`,
      }}
      onClick={onRemove}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: colors.icon }} />
      <p className="text-sm font-semibold leading-snug flex-1" style={{ color: colors.text }}>
        {toast.message}
      </p>
      <button className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity" style={{ color: colors.text }}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastsExternal = setToasts;
    if (toastQueue.length > 0) {
      setToasts(toastQueue.splice(0));
    }
    return () => { setToastsExternal = null; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-[99999] flex flex-col gap-3"
      style={{ pointerEvents: 'none' }}
    >
      {toasts.map(toast => (
        <div key={toast.id} style={{ pointerEvents: 'all' }}>
          <ToastItem
            toast={toast}
            onRemove={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        </div>
      ))}
    </div>
  );
}
