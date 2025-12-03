import type { Route } from "./+types/stickers.$sid";
import { Link, useParams } from "react-router";
import { useEffect, useState } from "react";
import { AlbumsAPI, type Sticker, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticker Detalle | BadgeUp" },
    { name: "description", content: "Detalle del sticker" },
  ];
}

export default function StickerDetail() {
  const { sid } = useParams();
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    let active = true;
    if (!sid) return;
    (async () => {
      try {
        const data = await AlbumsAPI.getSticker(sid);
        if (active) setSticker(data);
      } catch {
        if (active) error("No pudimos cargar la información del sticker.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [sid, error]);

  if (loading) {
    return <div className="p-10 text-gray-500">Cargando sticker...</div>;
  }

  if (!sticker) {
    return <div className="p-10 text-red-500">Sticker no encontrado.</div>;
  }

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  const hasLocation =
    (sticker as any).location_lat != null &&
    (sticker as any).location_lng != null &&
    MAPBOX_TOKEN;
  const mapUrl = hasLocation
    ? `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/` +
      `pin-s+ff0000(${(sticker as any).location_lng},${(sticker as any).location_lat})/` +
      `${(sticker as any).location_lng},${(sticker as any).location_lat},14,0/600x300?access_token=${MAPBOX_TOKEN}`
    : undefined;

  const photoUrl =
    resolveMediaUrl((sticker as any).unlocked_photo_url || sticker.image_reference) ||
    "https://placehold.co/800x400?text=Sticker";

  const isLocked = sticker.is_unlocked === false;
  const showLockedState = isLocked && !user?.is_staff;

  const albumTitle = (sticker as any).album_title || "Álbum actual";
  const albumId = (sticker as any).album_id ?? null;

  const funFact =
    (sticker as any).fun_fact ||
    "Pronto verás aquí un dato curioso generado por IA sobre este modelo.";
  const locationLabel =
    (sticker as any).location_label || "Ubicación pendiente";
  const unlockedAtRaw = (sticker as any).unlocked_at || null;
  const unlockedAt =
    unlockedAtRaw && typeof unlockedAtRaw === "string"
      ? (() => {
          try {
            const date = new Date(unlockedAtRaw);
            if (Number.isNaN(date.getTime())) return unlockedAtRaw;
            return new Intl.DateTimeFormat("es-MX", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            }).format(date);
          } catch {
            return unlockedAtRaw;
          }
        })()
      : "Fecha pendiente";
  const userMessage =
    (sticker as any).user_message ||
    "Aún no has agregado un mensaje para este logro.";

  return (
    <div className="bg-[#f3f6ff] font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-6 md:p-10 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl max-w-5xl w-full overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-50 flex items-center justify-center relative min-h-[320px]">
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={photoUrl}
                alt={sticker.name}
                className={
                  showLockedState
                    ? "max-h-[70vh] max-w-full w-auto h-auto object-contain opacity-0"
                    : "max-h-[70vh] max-w-full w-auto h-auto object-contain"
                }
              />
            </div>
            {showLockedState && (
              <>
                <div className="absolute inset-0 bg-black/85 pointer-events-none" />
                <img
                  src="/bloqueado.png"
                  alt="Sticker bloqueado"
                  className="pointer-events-none absolute w-48 md:w-64 rotate-6 drop-shadow-xl"
                />
              </>
            )}
          </div>

          <div className="md:w-1/2 p-6 md:p-8 flex flex-col gap-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {sticker.name}
              </h1>
              <p className="text-sm text-gray-500">
                Sticker #{sticker.order ?? "?"} · Álbum:{" "}
                <span className="font-medium text-gray-700">{albumTitle}</span>
              </p>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              {sticker.description || "Sin descripción disponible."}
            </p>

            <div className="bg-[#f1f5ff] border border-[#d5e0ff] rounded-2xl px-4 py-3 text-sm flex gap-3">
              <div className="mt-0.5 text-yellow-500 text-lg">💡</div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Dato curioso
                </p>
                <p className="text-gray-700">{funFact}</p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-700">
              <div className="mt-1">
                <p>
                  <span className="font-semibold">📍 Ubicación:</span>{" "}
                  {hasLocation ? "Ubicación capturada" : locationLabel}
                </p>
                {mapUrl && (
                  <img
                    src={mapUrl}
                    alt="Ubicación donde desbloqueaste este sticker"
                    className="mt-2 rounded-xl border border-gray-200 shadow-sm"
                  />
                )}
              </div>
              <p>
                <span className="font-semibold">🕒 Fecha y hora:</span>{" "}
                {unlockedAt}
              </p>
              <p>
                <span className="font-semibold">✅ Validación:</span>{" "}
                IA + GPS confirmados
              </p>
              <p>
                <span className="font-semibold">⭐ Puntos:</span>{" "}
                {sticker.reward_points ?? 0}
              </p>
            </div>

            <div className="mt-2">
              <h2 className="text-sm font-semibold text-gray-800 mb-1">
                Mensaje del usuario
              </h2>
              <p className="text-sm text-gray-700 italic border-l-4 border-blue-200 pl-3">
                “{userMessage}”
              </p>
            </div>

            <div className="pt-3">
              <Link
                to={
                  albumId != null
                    ? `/app/albums/${albumId}`
                    : "/app/albums"
                }
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#1e40af] text-white text-sm font-medium hover:bg-[#1d3a99] transition-colors"
              >
                ← Volver al Álbum
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
