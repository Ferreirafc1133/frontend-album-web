import type { Route } from "./+types/desbloqueo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticker Desbloqueado | BadgeUp" },
    { name: "description", content: "Sticker desbloqueado" },
  ];
}

export default function Desbloqueo() {
  return (
    <div className="bg-blue-50 font-sans min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-lg">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-green-600">
            <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800">Sticker desbloqueado</h2>
        <p className="text-gray-600 mt-2">Has obtenido un nuevo sticker para tu álbum</p>
        <div className="mt-6">
          <img
            src="https://images.unsplash.com/photo-1519638402307-55998d4a9b1e?w=600"
            alt="Sticker"
            className="w-48 h-48 object-cover rounded-xl mx-auto"
          />
        </div>
        <div className="mt-8 flex gap-3 justify-center">
          <a href="/albums" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Ver álbum</a>
          <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300">Compartir</button>
        </div>
      </div>
    </div>
  );
}
