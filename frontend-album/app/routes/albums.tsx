import type { Route } from "./+types/albums";
import { useLoaderData, Link } from "react-router";
import AlbumCard from "../components/AlbumCard";
import { AlbumsAPI, type Album } from "../services/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Álbumes" },
    { name: "description", content: "Listado de álbumes" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const albums = await AlbumsAPI.list();
  return { albums };
}

export default function Albums() {
  const { albums } = useLoaderData<typeof loader>() as { albums: Album[] };
  return (
    <main className="p-8 container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Álbumes</h1>
        <Link to="/albums/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Crear álbum
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {albums.map((a) => (
          <AlbumCard key={a.id} album={a} />
        ))}
      </div>
    </main>
  );
}
