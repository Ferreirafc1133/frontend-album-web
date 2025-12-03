import { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { useToast } from "../ui/ToastProvider";
import { buildWsBase, type NotificationEvent } from "../services/api";

export function NotificationsSocket({ onEvent }: { onEvent?: (ev: NotificationEvent) => void }) {
  const token = useUserStore((s) => s.token);
  const { success } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [lastEvent, setLastEvent] = useState<NotificationEvent | null>(null);

  const wsUrl = useMemo(() => {
    if (!token) return null;
    const base =
      (import.meta.env.VITE_WS_URL as string | undefined) ||
      buildWsBase((import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api");
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
          const ev: NotificationEvent = {
            title,
            message: msg,
            category: data.category || "info",
            at: new Date().toISOString(),
          };
          setLastEvent(ev);
          success(`${title}: ${msg}`);
          if (onEvent) onEvent(ev);
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
