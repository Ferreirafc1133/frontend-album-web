import type { Route } from "./+types/contra";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Recuperar contraseña | Sistema de Formularios" },
    { name: "description", content: "Recuperar acceso" },
  ];
}

export default function Contra() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200"
          alt="Oficina moderna"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/90 to-blue-900/80" />
        <div className="relative z-10 text-white text-center px-10">
          <img
            src="https://tailwindui.com/img/logos/mark.svg?color=white"
            alt="Logo institucional"
            className="w-24 h-24 mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold mb-3">¿Olvidaste tu contraseña?</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
          </p>
        </div>
      </div>

      <div className="flex flex-1 justify-center items-center bg-white shadow-2xl">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <img
              src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
              alt="Logo"
              className="w-14 h-14 mx-auto mb-4"
            />
            <h2 className="text-3xl font-semibold text-gray-800">Recuperar acceso</h2>
            <p className="text-gray-500 text-sm mt-2">
              Te enviaremos instrucciones para restablecer tu contraseña
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Enviar enlace de recuperación
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
