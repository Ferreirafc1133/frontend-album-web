import type { Route } from "./+types/notificaciones";
import { useEffect, useState } from "react";
import { FriendsAPI, type ApiUser } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notificaciones | BadgeUp" },
    { name: "description", content: "Actividad reciente" },
  ];
}

export default function Notificaciones() {
  const [events, setEvents] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await FriendsAPI.list(10);
        if (active) setEvents(data);
      } catch {
        if (active) error("No pudimos cargar las notificaciones.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [error]);

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Actividad reciente</h2>
          <span className="text-sm text-gray-500">{events.length} eventos</span>
        </div>

        <div className="space-y-4 max-w-4xl">
          {loading ? (
            <p className="text-gray-500">Cargando...</p>
          ) : events.length === 0 ? (
            <p className="text-gray-500">Aún no hay actividad registrada.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white border-l-4 border-blue-600 p-5 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">
                    {event.username.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{event.username} sumó puntos</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.first_name || event.username} ahora tiene {event.points} puntos en BadgeUp.
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(event.date_joined).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
