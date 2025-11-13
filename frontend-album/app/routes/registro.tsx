import type { Route } from "./+types/registro";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro | Sistema de Formularios" },
    { name: "description", content: "Crear cuenta" },
  ];
}

export default function Registro() {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="hidden md:flex w-1/2 relative items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200"
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
          <h1 className="text-4xl font-bold mb-3">Bienvenido a BadgeUp</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Regístrate para empezar a coleccionar tus logros y administrar tus formularios fácilmente.
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
            <h2 className="text-3xl font-semibold text-gray-800">Crear cuenta</h2>
            <p className="text-gray-500 text-sm mt-2">Usa tus datos o accede con una red social</p>
          </div>

          <div className="space-y-3 mb-6">
            <button className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
              <span className="text-gray-700 font-medium">Registrarte con Google</span>
            </button>
            <button className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
              <img src="https://www.svgrepo.com/show/452196/facebook-1.svg" className="w-5 h-5 mr-2" alt="Facebook" />
              <span className="text-gray-700 font-medium">Registrarte con Facebook</span>
            </button>
            <button className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
              <img src="https://www.svgrepo.com/show/303128/apple-logo.svg" className="w-5 h-5 mr-2" alt="Apple" />
              <span className="text-gray-700 font-medium">Registrarte con Apple</span>
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="nombre">Nombre completo</label>
              <input id="nombre" type="text" placeholder="Tu nombre completo" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">Correo electrónico</label>
              <input id="email" type="email" placeholder="ejemplo@correo.com" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">Contraseña</label>
              <input id="password" type="password" placeholder="********" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Crear cuenta</button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" className="text-blue-600 font-medium hover:underline">Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

