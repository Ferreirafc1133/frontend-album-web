import type { Route } from "./+types/notificaciones";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NotificationEvent } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

const wsBase = () => {
  const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (envUrl) return envUrl;
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notificaciones | BadgeUp" },
    { name: "description", content: "Actividad en tiempo real" },
  ];
}

const colorByCategory: Record<string, string> = {
  friend_request: "border-amber-500 bg-amber-50",
  friend_accept: "border-green-500 bg-green-50",
  sticker_unlock: "border-blue-500 bg-blue-50",
  sticker_new: "border-purple-500 bg-purple-50",
  chat_message: "border-indigo-500 bg-indigo-50",
  info: "border-gray-400 bg-gray-50",
};

export default function Notificaciones() {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const token = useUserStore((s) => s.token);
  const { error } = useToast();
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
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "notification") {
          const next: NotificationEvent = {
            title: data.title || "Notificación",
            message: data.message || "",
            category: data.category || "info",
            at: new Date().toISOString(),
          };
          setEvents((prev) => [next, ...prev].slice(0, 50));
        }
      } catch (e) {
        error("No pudimos leer una notificación.");
      }
    };
    return () => ws.close();
  }, [wsUrl, error]);

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Notificaciones en vivo</h2>
            <p className="text-sm text-gray-500">
              Conectado: {connected ? "Sí" : "No"} · Últimas {events.length}
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-3xl">
          {events.length === 0 ? (
            <p className="text-gray-500">Aún no hay actividad.</p>
          ) : (
            events.map((event, idx) => {
              const style = colorByCategory[event.category || "info"] || colorByCategory.info;
              return (
                <div
                  key={idx}
                  className={`border-l-4 rounded-lg p-4 shadow ${style}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{event.message}</p>
                    </div>
                    <span className="text-[11px] text-gray-500">{event.at ? new Date(event.at).toLocaleString() : ""}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
