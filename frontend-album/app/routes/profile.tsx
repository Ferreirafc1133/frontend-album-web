import type { Route } from "./+types/profile";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Perfil | BadgeUp" },
    { name: "description", content: "Perfil de usuario" },
  ];
}

export default function Profile() {
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-8">
            <img
              src="https://i.pravatar.cc/150?img=8"
              alt="Usuario"
              className="w-40 h-40 rounded-full border-4 border-blue-600"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Fernando Chávez</h2>
              <p className="text-gray-600 mb-4">Jugador nivel 27 · Guadalajara, MX</p>
              <div className="flex space-x-8">
                <div>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                  <p className="text-sm text-gray-500">Álbumes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">120</p>
                  <p className="text-sm text-gray-500">Stickers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                  <p className="text-sm text-gray-500">Insignias</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">540</p>
                  <p className="text-sm text-gray-500">Likes</p>
                </div>
              </div>
            </div>
          </div>

          <Link to="/profile/edit" className="mt-6 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            Editar perfil
          </Link>
        </div>

        <section className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Insignias obtenidas</h3>
          <div className="flex flex-wrap gap-5">
            <div className="bg-yellow-100 border border-yellow-400 p-4 rounded-lg text-center w-40">
              <p className="mt-2 font-medium text-gray-700">Coleccionista</p>
            </div>
            <div className="bg-green-100 border border-green-400 p-4 rounded-lg text-center w-40">
              <p className="mt-2 font-medium text-gray-700">Explorador</p>
            </div>
            <div className="bg-blue-100 border border-blue-400 p-4 rounded-lg text-center w-40">
              <p className="mt-2 font-medium text-gray-700">Completista</p>
            </div>
            <div className="bg-purple-100 border border-purple-400 p-4 rounded-lg text-center w-40">
              <p className="mt-2 font-medium text-gray-700">Velocista</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Álbumes recientes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1519638402307-55998d4a9b1e?ixlib=rb-4.0.3&q=80&w=800"
                alt="Foto 1"
                className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white flex justify-between items-center">
                <p className="font-semibold">Camaro 1969</p>
                <span className="text-sm">87</span>
              </div>
            </div>

            <div className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&q=80&w=800"
                alt="Foto 2"
                className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white flex justify-between items-center">
                <p className="font-semibold">Playa del Carmen</p>
                <span className="text-sm">64</span>
              </div>
            </div>

            <div className="relative group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&q=80&w=800"
                alt="Foto 3"
                className="object-cover w-full h-56 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 text-white flex justify-between items-center">
                <p className="font-semibold">Gym Session</p>
                <span className="text-sm">59</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
