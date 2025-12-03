import type { Route } from "./+types/albums";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import AlbumCard from "../components/AlbumCard";
import { AlbumsAPI, type AlbumSummary } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Álbumes" },
    { name: "description", content: "Listado de álbumes" },
  ];
}

export default function Albums() {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await AlbumsAPI.list();
        if (mounted) setAlbums(data);
      } catch {
        if (mounted) error("No pudimos cargar los álbumes");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [error]);

  return (
    <main className="p-8 container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Álbumes</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">{albums.length} registros</div>
          {user?.is_staff && (
            <Link
              to="/app/albums/create"
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Crear álbum
            </Link>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-3">Cargando...</p>
        ) : albums.length === 0 ? (
          <p className="text-gray-500 col-span-3">Aún no hay álbumes disponibles.</p>
        ) : (
          albums.map((a) => <AlbumCard key={a.id} album={a} />)
        )}
      </div>
    </main>
  );
}
