import type { Route } from "./+types/albums.edit.$id";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Editar Álbum" },
    { name: "description", content: "Editar álbum" },
  ];
}

export default function EditAlbum() {
  return (
    <main className="pt-16 p-8 container mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800">Editar álbum</h1>
    </main>
  );
}

