import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

type ConfirmContextValue = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(v: boolean) => void>(() => () => {});

  const confirm = useCallback((o?: ConfirmOptions) => {
    setOpts(o || {});
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handle = useCallback((value: boolean) => {
    setOpen(false);
    resolver(value);
  }, [resolver]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {opts.title || "Confirmación"}
              </h2>
              {opts.description && (
                <p className="text-gray-600 mt-2">{opts.description}</p>
              )}
            </div>
            <div className="p-4 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={() => handle(false)}
              >
                {opts.cancelText || "Cancelar"}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => handle(true)}
              >
                {opts.confirmText || "Aceptar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("ConfirmProvider is missing");
  return ctx;
}

