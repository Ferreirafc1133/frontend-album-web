import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { AlbumsAPI, type AlbumSummary, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | Álbum App" },
    { name: "description", content: "Inicio" },
  ];
}

export default function Home() {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await AlbumsAPI.list();
        if (active) setAlbums(data.slice(0, 3));
      } catch {
        if (active) error("No pudimos cargar tus álbumes");
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
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Tus Álbumes</h2>
            <p className="text-gray-500">
              {user ? `${user.first_name || user.username}, tienes ${user.computed_points ?? 0} puntos acumulados.` : "Revisa tu progreso diario"}
            </p>
          </div>
          <p className="text-sm text-gray-600">Álbumes disponibles: {albums.length}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500 col-span-3">Cargando álbumes...</p>
          ) : albums.length === 0 ? (
            <p className="text-gray-500 col-span-3">No hay álbumes disponibles.</p>
          ) : (
            albums.map((album) => (
              <div key={album.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                <img
                  src={resolveMediaUrl(album.cover_image) || "https://placehold.co/600x240?text=Album"}
                  className="w-full h-40 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800">{album.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {album.theme || "Sin tema"} · {album.stickers_count} stickers
                  </p>
                  <Link
                    to={`/app/albums/${album.id}`}
                    className="block text-center bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
                  >
                    Ver álbum
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Logros recientes de tus amigos</h2>
          <div className="bg-white p-6 rounded-xl shadow-md space-y-3 text-gray-600">
            {albums.map((album) => (
              <p key={album.id}>
                {album.title} · {album.stickers_count} stickers registrados
              </p>
            ))}
            {albums.length === 0 && <p>No hay actividad registrada todavía.</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
