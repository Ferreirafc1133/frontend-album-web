import type { Route } from "./+types/albums.create";
import { useEffect, useState } from "react";
import { AlbumsAPI, type AlbumSummary } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crear Álbum" },
    { name: "description", content: "Administración de álbumes" },
  ];
}

export default function CreateAlbum() {
  const { error } = useToast();
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await AlbumsAPI.list();
        if (mounted) setAlbums(data);
      } catch {
        if (mounted) error("No pudimos consultar los álbumes existentes.");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [error]);

  return (
    <main className="p-8 container mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Creación de álbumes</h1>
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4 text-gray-600">
        <p>
          La creación y actualización de álbumes se gestiona desde el panel administrativo del backend. Actualmente existen{" "}
          <strong>{albums.length}</strong> álbumes registrados en la base de datos.
        </p>
        <p>
          Si necesitas agregar un nuevo álbum o modificar uno existente, hazlo desde el admin de Django o desde los servicios del backend.
        </p>
      </div>
    </main>
  );
}
