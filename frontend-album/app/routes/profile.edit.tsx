import type { Route } from "./+types/profile.edit";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Editar Perfil | BadgeUp" },
    { name: "description", content: "Editar perfil de usuario" },
  ];
}

export default function EditProfile() {
  return (
    <main className="p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Editar perfil</h1>
        <Link to="/profile" className="text-blue-600 hover:underline">Volver</Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="name">Nombre</label>
              <input id="name" type="text" defaultValue="Fernando Chávez" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">Correo</label>
              <input id="email" type="email" defaultValue="fernando@example.com" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="city">Ciudad</label>
              <input id="city" type="text" defaultValue="Guadalajara, MX" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="level">Nivel</label>
              <input id="level" type="number" defaultValue={27} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="bio">Bio</label>
            <textarea id="bio" rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Cuéntanos algo sobre ti" />
          </div>

          <div className="flex items-center gap-4">
            <img src="https://i.pravatar.cc/150?img=8" alt="Avatar" className="w-16 h-16 rounded-full border" />
            <label className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer">
              Cambiar foto
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>

          <div className="flex gap-3 justify-end">
            <Link to="/profile" className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300">Cancelar</Link>
            <button type="button" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">Guardar</button>
          </div>
        </form>
      </div>
    </main>
  );
}

