import { createContext, useContext, useMemo, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
};

type ToastContextValue = {
  add: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType = "info", duration = 12000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => remove(id), duration);
    }
  }, [remove]);

  const success = useCallback((m: string, d?: number) => add(m, "success", d), [add]);
  const error = useCallback((m: string, d?: number) => add(m, "error", d), [add]);
  const info = useCallback((m: string, d?: number) => add(m, "info", d), [add]);

  const value = useMemo(() => ({ add, success, error, info }), [add, success, error, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const colors: Record<ToastType, string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  };
  return (
    <div className={`text-white rounded-lg shadow-lg ${colors[toast.type]} overflow-hidden`}>
      <div className="px-4 py-3 flex items-start justify-between">
        <div className="pr-2 text-sm">{toast.message}</div>
        <button className="ml-3 text-white/80 hover:text-white" onClick={onClose}>×</button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    const noop = () => undefined;
    return {
      add: noop,
      success: noop,
      error: noop,
      info: noop,
    };
  }
  return ctx;
}
