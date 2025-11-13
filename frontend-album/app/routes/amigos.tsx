import type { Route } from "./+types/amigos";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amigos | BadgeUp" },
    { name: "description", content: "Tus amigos" },
  ];
}

export default function Amigos() {
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">BadgeUp</h1>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li><a href="#" className="hover:text-blue-600">Inicio</a></li>
          <li><a href="#" className="hover:text-blue-600">Álbumes</a></li>
          <li><a href="#" className="hover:text-blue-600">Ranking</a></li>
          <li><a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-1">Amigos</a></li>
          <li><a href="#" className="hover:text-blue-600">Perfil</a></li>
        </ul>
      </nav>

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Tus Amigos</h2>
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
            Agregar amigo
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition">
            <img src="https://i.pravatar.cc/80?img=1" className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">María López</h3>
              <p className="text-sm text-gray-500">Completó 5 álbumes</p>
              <p className="text-xs text-green-600 font-medium">Activo ahora</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition">
            <img src="https://i.pravatar.cc/80?img=3" className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Carlos Pérez</h3>
              <p className="text-sm text-gray-500">Completó 4 álbumes</p>
              <p className="text-xs text-gray-400 font-medium">Último login: 2h</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition">
            <img src="https://i.pravatar.cc/80?img=4" className="w-16 h-16 rounded-full" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Laura Gómez</h3>
              <p className="text-sm text-gray-500">Completó 3 álbumes</p>
              <p className="text-xs text-green-600 font-medium">Activo ahora</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

