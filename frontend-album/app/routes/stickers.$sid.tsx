import type { Route } from "./+types/stickers.$sid";
import { useLoaderData } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticker Detalle" },
    { name: "description", content: "Detalle del sticker" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const sid = params.sid as string;
  return { sid };
}

export default function StickerDetail() {
  const { sid } = useLoaderData<typeof loader>() as { sid: string };
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/2 bg-gray-50 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1519638402307-55998d4a9b1e?w=800"
              alt="Sticker"
              className="object-cover w-full h-full max-h-[420px]"
            />
          </div>
          <div className="md:w-1/2 p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Sticker {sid}</h2>
            <p className="text-gray-600">Detalle del sticker seleccionado</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Estado</p>
                <p className="font-medium text-gray-800">Desbloqueado</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Rareza</p>
                <p className="font-medium text-gray-800">Alta</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Likes</p>
                <p className="font-medium text-gray-800">87</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="font-medium text-gray-800">2024-11-12</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Compartir</button>
              <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300">Eliminar</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

