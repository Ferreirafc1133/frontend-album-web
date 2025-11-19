import type { Route } from "./+types/login";
import { useEffect, useState } from "react";
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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { success, error } = useToast();
  const setAuth = useUserStore((state) => state.setAuth);
  const token = useUserStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      console.log("LOGIN_ALREADY_AUTH");
      navigate("/app", { replace: true });
    }
  }, [token, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      error("Usuario requerido");
      return;
    }
    console.log("LOGIN_SUBMIT", username);
    try {
      const resp = await AuthAPI.login(username.trim(), password);
      setAuth({ token: resp.access, refreshToken: resp.refresh, user: resp.user });
      success("Sesión iniciada");
      console.log("LOGIN_SUCCESS", resp.user?.username);
      navigate("/app");
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Credenciales inválidas";
      console.log("LOGIN_ERROR", message);
      error(message);
    }
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
              Usa las credenciales que registraste en BadgeUp
            </p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Tu usuario"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              <a href="/contra" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Entrar</button>

            <p className="text-center text-sm text-gray-500 mt-6">
              ¿No tienes cuenta?{" "}
              <a href="/registro" className="text-blue-600 hover:underline">
                Regístrate aquí
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
