import type { Route } from "./+types/login";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { AuthAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | Sistema de Formularios" },
    { name: "description", content: "Iniciar sesión" },
  ];
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { success, error } = useToast();
  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { error("Correo requerido"); return; }
    const user = await AuthAPI.login(email, password);
    setUser(user);
    success("Sesión iniciada");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white flex-col justify-center items-center p-10">
        <img
          src="https://tailwindui.com/img/logos/mark.svg?color=white"
          alt="Logo institucional"
          className="w-24 h-24 mb-6"
        />
        <h1 className="text-4xl font-bold mb-4 text-center">Sistema de Registro</h1>
        <p className="text-lg text-blue-100 text-center w-3/4 leading-relaxed">
          Gestiona tus formularios, usuarios y proyectos desde una plataforma moderna, segura y accesible.
        </p>
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
          alt="Oficina"
          className="rounded-2xl shadow-lg mt-10 w-3/4 object-cover"
        />
      </div>

      <div className="flex flex-1 justify-center items-center bg-white shadow-xl">
        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <img
              src="https://tailwindui.com/img/logos/mark.svg?color=blue&shade=600"
              alt="Logo"
              className="w-14 h-14 mx-auto mb-4"
            />
            <h2 className="text-3xl font-semibold text-gray-800">Iniciar sesión</h2>
            <p className="text-gray-500 text-sm mt-2">
              Ingresa tus credenciales o accede con tu cuenta favorita
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <button className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="w-5 h-5 mr-2"
                alt="Google"
              />
              <span className="text-gray-700 font-medium">Continuar con Google</span>
            </button>

            <button className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
              <img
                src="https://www.svgrepo.com/show/452196/facebook-1.svg"
                className="w-5 h-5 mr-2"
                alt="Facebook"
              />
              <span className="text-gray-700 font-medium">Continuar con Facebook</span>
            </button>

            <button className="flex items-center justify-center w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition">
              <img
                src="https://www.svgrepo.com/show/303128/apple-logo.svg"
                className="w-5 h-5 mr-2"
                alt="Apple"
              />
              <span className="text-gray-700 font-medium">Continuar con Apple</span>
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">o</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="accent-blue-600" />
                <span>Recordarme</span>
              </label>
              <a href="#" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Entrar</button>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes cuenta?{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Regístrate aquí
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
