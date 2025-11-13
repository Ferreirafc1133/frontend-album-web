import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | Álbum App" },
    { name: "description", content: "Inicio" },
  ];
}

export default function Home() {
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">BadgeUp</h1>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li><a href="#" className="hover:text-blue-600">Inicio</a></li>
          <li><a href="#" className="hover:text-blue-600">Mis Álbumes</a></li>
          <li><a href="#" className="hover:text-blue-600">Ranking</a></li>
          <li><a href="#" className="hover:text-blue-600">Amigos</a></li>
          <li><a href="#" className="hover:text-blue-600">Notificaciones</a></li>
        </ul>
        <div className="flex items-center space-x-3">
          <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-10 h-10 rounded-full border" />
          <span className="text-gray-700 font-medium">Fernando</span>
        </div>
      </nav>

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800">Tus Álbumes</h2>
            <p className="text-gray-500">Sigue coleccionando logros y completa tus álbumes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img src="https://cdn.buttercms.com/cc9SjR9RRZqhRb9Y8OPn" className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800">Autos Clásicos</h3>
              <p className="text-sm text-gray-500 mb-3">12/40 stickers conseguidos</p>
              <button className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">Ver álbum</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600" className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800">Playas de México</h3>
              <p className="text-sm text-gray-500 mb-3">7/30 stickers conseguidos</p>
              <button className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">Ver álbum</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600" className="w-full h-40 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800">Reto Fitness</h3>
              <p className="text-sm text-gray-500 mb-3">20/50 stickers conseguidos</p>
              <button className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">Ver álbum</button>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Logros recientes de tus amigos</h2>
          <div className="bg-white p-6 rounded-xl shadow-md space-y-3">
            <p>
              <strong>María</strong> desbloqueó el sticker “Camaro 1969” en <em>Autos Clásicos</em>
            </p>
            <p>
              <strong>Carlos</strong> completó el álbum <em>Playas de México</em>
            </p>
            <p>
              <strong>Laura</strong> logró 50 entrenamientos seguidos en <em>Reto Fitness</em>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
