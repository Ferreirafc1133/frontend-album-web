import type { Route } from "./+types/notificaciones";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notificaciones | BadgeUp" },
    { name: "description", content: "Notificaciones" },
  ];
}

function Dot({ color }: { color: string }) {
  return <span className={`w-3 h-3 rounded-full ${color} inline-block`} />;
}

export default function Notificaciones() {
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600">BadgeUp</h1>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li><a href="#" className="hover:text-blue-600">Inicio</a></li>
          <li><a href="#" className="hover:text-blue-600">Álbumes</a></li>
          <li><a href="#" className="hover:text-blue-600">Ranking</a></li>
          <li><a href="#" className="hover:text-blue-600">Amigos</a></li>
          <li><a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-1">Notificaciones</a></li>
        </ul>
      </nav>

      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Notificaciones</h2>
          <button className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 transition">
            Marcar todas como leídas
          </button>
        </div>

        <div className="space-y-4 max-w-4xl">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-semibold">N</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Nuevo logro desbloqueado</h3>
                <p className="text-sm text-gray-600 mt-1">Has completado el álbum Mundial 2022</p>
                <p className="text-xs text-gray-400 mt-2">Hace 5 minutos</p>
              </div>
              <Dot color="bg-blue-600" />
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-semibold">S</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Nueva solicitud de amistad</h3>
                <p className="text-sm text-gray-600 mt-1">Carlos Pérez quiere ser tu amigo</p>
                <div className="flex space-x-3 mt-3">
                  <button className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700 transition">Aceptar</button>
                  <button className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg text-sm hover:bg-gray-400 transition">Rechazar</button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Hace 1 hora</p>
              </div>
              <Dot color="bg-blue-600" />
            </div>
          </div>

          <div className="bg-white border-l-4 border-gray-300 p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">I</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Intercambio completado</h3>
                <p className="text-sm text-gray-600 mt-1">María López aceptó tu intercambio de estampas</p>
                <p className="text-xs text-gray-400 mt-2">Hace 3 horas</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-l-4 border-gray-300 p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-semibold">R</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Subiste en el ranking</h3>
                <p className="text-sm text-gray-600 mt-1">Ahora estás en el puesto 12 del ranking global</p>
                <p className="text-xs text-gray-400 mt-2">Hace 1 día</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-l-4 border-gray-300 p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-semibold">N</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Nuevas estampas disponibles</h3>
                <p className="text-sm text-gray-600 mt-1">Se agregaron 10 estampas al álbum Champions League</p>
                <p className="text-xs text-gray-400 mt-2">Hace 2 días</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-l-4 border-gray-300 p-5 rounded-lg shadow-md hover:shadow-lg transition">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 font-semibold">C</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">Nuevo comentario</h3>
                <p className="text-sm text-gray-600 mt-1">Laura Gómez comentó en tu álbum completado</p>
                <p className="text-xs text-gray-400 mt-2">Hace 3 días</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

