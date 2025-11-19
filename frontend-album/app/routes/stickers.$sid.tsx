import type { Route } from "./+types/stickers.$sid";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { AlbumsAPI, type Sticker, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticker Detalle" },
    { name: "description", content: "Detalle del sticker" },
  ];
}

export default function StickerDetail() {
  const { sid } = useParams();
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

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

  const reference = resolveMediaUrl(sticker.image_reference) || "https://placehold.co/800x400?text=Sticker";

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-50 flex items-center justify-center">
            <img src={reference} alt={sticker.name} className="object-cover w-full h-full max-h-[420px]" />
          </div>
          <div className="md:w-1/2 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">{sticker.name}</h2>
            <p className="text-gray-600">{sticker.description || "Sin descripción disponible."}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Puntos</p>
                <p className="font-medium text-gray-800">{sticker.reward_points}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Orden</p>
                <p className="font-medium text-gray-800">{sticker.order}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="font-medium text-gray-800">
                  {sticker.location_lat ?? "?"} , {sticker.location_lng ?? "?"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
