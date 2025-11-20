import type { Route } from "./+types/albums.$id";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { AlbumsAPI, type AlbumDetail, type Sticker, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useConfirm } from "../ui/ConfirmProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Álbum | BadgeUp" },
    { name: "description", content: "Detalle del álbum" },
  ];
}

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busySticker, setBusySticker] = useState<number | null>(null);
  const { error, success } = useToast();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        const data = await AlbumsAPI.get(id);
        if (mounted) setAlbum(data);
      } catch {
        if (mounted) error("No pudimos cargar el álbum.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, error]);

  const handleCapture = async (sticker: Sticker) => {
    const ok = await confirm({
      title: "Capturar sticker",
      description: `Comparte una URL de la evidencia para ${sticker.name}`,
      confirmText: "Enviar",
      cancelText: "Cancelar",
    });
    if (!ok) return;
    const photoUrl = window.prompt("Pega la URL de la foto tomada en campo");
    if (!photoUrl) {
      error("Necesitas proporcionar una URL de evidencia.");
      return;
    }
    try {
      setBusySticker(sticker.id);
      await AlbumsAPI.captureSticker(sticker.id, photoUrl);
      success("Solicitud enviada para validación.");
      navigate(`/app/desbloqueo?sticker=${encodeURIComponent(sticker.name)}&album=${encodeURIComponent(album?.title || "")}`);
    } catch {
      error("No se pudo capturar el sticker.");
    } finally {
      setBusySticker(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-500">Cargando álbum...</div>;
  }

  if (!album) {
    return <div className="p-10 text-red-500">Álbum no encontrado.</div>;
  }

  const cover = resolveMediaUrl(album.cover_image) || "https://placehold.co/1200x320?text=Album";

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <header className="text-white py-10 px-8 shadow-md" style={{ backgroundColor: "#0d47a1" }}>
        <h2 className="text-3xl font-bold mb-2">{album.title}</h2>
        <p className="text-blue-100">{album.theme || "Sin tema"}</p>
        <img src={cover} alt={album.title} className="w-full max-w-4xl mx-auto rounded-xl mt-6 shadow-lg" />
      </header>

      <main className="flex-1 p-10 space-y-10">
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Descripción</h3>
          <p className="text-gray-600 leading-relaxed max-w-4xl">{album.description || "Este álbum aún no tiene descripción."}</p>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">Stickers</h3>
            <p className="text-sm text-gray-500">{album.stickers.length} disponibles</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {album.stickers.map((sticker) => (
              <div key={sticker.id} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">{sticker.name}</h4>
                  <span className="text-xs text-gray-500">{sticker.reward_points} pts</span>
                </div>
                <p className="text-sm text-gray-600 flex-1">{sticker.description || "Sin descripción"}</p>
                {sticker.image_reference && (
                  <img
                    src={resolveMediaUrl(sticker.image_reference) || ""}
                    alt={sticker.name}
                    className="rounded-lg object-cover h-32 w-full"
                  />
                )}
                <div className="flex gap-2">
                  <Link
                    to={`/app/stickers/${sticker.id}`}
                    className="flex-1 text-center border border-blue-600 text-blue-600 rounded-lg py-1 text-sm hover:bg-blue-50"
                  >
                    Detalle
                  </Link>
                  <button
                    className="flex-1 bg-blue-600 text-white rounded-lg py-1 text-sm hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => handleCapture(sticker)}
                    disabled={busySticker === sticker.id}
                  >
                    {busySticker === sticker.id ? "Enviando..." : "Capturar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
