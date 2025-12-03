import type { Route } from "./+types/profile";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { AlbumsAPI, type AlbumSummary, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Perfil | BadgeUp" },
    { name: "description", content: "Perfil de usuario" },
  ];
}

export default function Profile() {
  const user = useUserStore((state) => state.user);
  const { error } = useToast();
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await AlbumsAPI.list();
        if (active) setAlbums(data.slice(0, 3));
      } catch {
        if (active) error("No pudimos cargar tus álbumes recientes.");
      }
    })();
    return () => {
      active = false;
    };
  }, [error]);

  if (!user) {
    return <div className="p-10 text-gray-500">Cargando perfil...</div>;
  }

  const avatar = resolveMediaUrl(user.avatar) || "https://www.gravatar.com/avatar/?d=mp&f=y";
  const roleLabel = user.is_staff ? "Administrador" : "Usuario";

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10 max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-8">
          <img src={avatar} alt={user.username} className="w-40 h-40 rounded-full border-4 border-blue-600 object-cover" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {user.first_name || user.username} {user.last_name}
            </h2>
            <p className="text-gray-600 mb-1">{user.email}</p>
            <p className="text-sm text-gray-500 mb-3">{roleLabel}</p>
            <div className="flex space-x-8">
              <div>
                <p className="text-2xl font-bold text-blue-600">{user.computed_points ?? 0}</p>
                <p className="text-sm text-gray-500">Puntos acumulados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{albums.length}</p>
                <p className="text-sm text-gray-500">Álbumes visibles</p>
              </div>
            </div>
          </div>
        </div>
        <Link to="/app/profile/edit" className="mt-6 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Editar perfil
        </Link>
      </div>

      <section className="mt-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Biografía</h3>
        <p className="text-gray-600">{user.bio || "Aún no agregas una biografía."}</p>
      </section>

      <section className="mt-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Álbumes recientes</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {albums.length === 0 ? (
            <p className="text-gray-500 col-span-3">Sin álbumes registrados todavía.</p>
          ) : (
            albums.map((album) => (
              <div key={album.id} className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
                <img
                  src={resolveMediaUrl(album.cover_image) || "https://placehold.co/600x240"}
                  alt={album.title}
                  className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white flex justify-between items-center">
                  <p className="font-semibold">{album.title}</p>
                  <span className="text-sm">{album.stickers_count} stickers</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </main>
    </div>
  );
}
