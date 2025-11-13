import type { Route } from "./+types/albums.create";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crear Álbum" },
    { name: "description", content: "Crear nuevo álbum" },
  ];
}

export default function CreateAlbum() {
  return (
    <main className="pt-16 p-8 container mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800">Crear álbum</h1>
    </main>
  );
}

