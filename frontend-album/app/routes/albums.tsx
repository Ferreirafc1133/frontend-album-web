import type { Route } from "./+types/albums";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Álbumes" },
    { name: "description", content: "Listado de álbumes" },
  ];
}

export default function Albums() {
  return (
    <main className="pt-16 p-8 container mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800">Álbumes</h1>
    </main>
  );
}

