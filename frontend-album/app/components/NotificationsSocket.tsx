import { useEffect, useMemo, useRef } from "react";
import { useUserStore } from "../store/useUserStore";
import { useToast } from "../ui/ToastProvider";

const wsBase = () => {
  const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (envUrl) return envUrl;
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
};

export function NotificationsSocket() {
  const token = useUserStore((s) => s.token);
  const { success } = useToast();
  const wsRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    if (!token) return null;
    const base = wsBase();
    return `${base}/ws/notifications/?token=${token}`;
  }, [token]);

  useEffect(() => {
    if (!wsUrl) return;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "notification") {
          const title = data.title || "Notificación";
          const msg = data.message || "";
          success(`${title}: ${msg}`);
        }
      } catch (err) {
        console.error(err);
      }
    };
    return () => {
      ws.close();
    };
  }, [wsUrl, success]);

  return null;
}
