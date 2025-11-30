import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { StickerLocation } from "../services/api";
import { StickersAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import "mapbox-gl/dist/mapbox-gl.css";

export function meta() {
  return [
    { title: "Mapa de capturas | BadgeUp" },
    { name: "description", content: "Mapa mundial de stickers desbloqueados" },
  ];
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function WorldMapPage() {
  const [locations, setLocations] = useState<StickerLocation[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { error } = useToast();

  const buildMarkerElement = () => {
    const el = document.createElement("div");
    el.textContent = "🚗";
    Object.assign(el.style, {
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "#ffffff",
      border: "2px solid #2563eb",
      boxShadow: "0 12px 30px rgba(31, 41, 55, 0.28)",
      fontSize: "20px",
      lineHeight: "1",
      color: "#1f2937",
    });
    return el;
  };

  // 1) Traer ubicaciones del backend
  useEffect(() => {
    (async () => {
      try {
        const data = await StickersAPI.locations();
        setLocations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        error("No pudimos cargar las ubicaciones.");
      }
    })();
  }, [error]);

  // 2) Inicializar el mapa UNA sola vez
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !MAPBOX_TOKEN) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 20], // centro "mundial"
      zoom: 1.5,
    });

    // Limpieza al salir de la página
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // 3) Pintar marcadores cuando cambien las locations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Array.isArray(locations)) return;

    // Limpiar marcadores viejos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      if (loc.location_lat == null || loc.location_lng == null) return;

      const lng = Number(loc.location_lng);
      const lat = Number(loc.location_lat);
      if (Number.isNaN(lng) || Number.isNaN(lat)) return;

      const popupHtml = `
        <div style="font-size:12px; line-height:1.4;">
          <strong>${loc.sticker_name}</strong><br/>
          Usuario: ${loc.username}<br/>
          Álbum: ${loc.album_title}<br/>
          ${loc.unlocked_at ? `Fecha: ${new Date(loc.unlocked_at).toLocaleString()}` : ""}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: buildMarkerElement(), anchor: "center" })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 24 }).setHTML(popupHtml))
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [locations]);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mapa de capturas</h1>
          <p className="text-sm text-gray-600">
            Explora en qué parte del mundo se han desbloqueado stickers.
          </p>
        </div>
      </header>

      <main className="flex-1 py-4">
        <div className="max-w-5xl mx-auto px-4">
          {!MAPBOX_TOKEN ? (
            <p className="text-red-600">
              Falta configurar <code>VITE_MAPBOX_TOKEN</code> en el frontend.
            </p>
          ) : (
            <div
              ref={mapContainerRef}
              className="w-full h-[600px] rounded-2xl shadow-lg overflow-hidden bg-gray-200"
            />
          )}
        </div>
      </main>
    </div>
  );
}
