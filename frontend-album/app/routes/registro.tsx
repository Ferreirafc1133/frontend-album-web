import type { Route } from "./+types/registro";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { AuthAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro | Sistema de Formularios" },
    { name: "description", content: "Crear cuenta" },
  ];
}

export default function Registro() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const { success, error } = useToast();
  const setAuth = useUserStore((state) => state.setAuth);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) {
      error("Completa todos los campos obligatorios.");
      return;
    }
    if (password !== passwordConfirm) {
      error("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    console.log("REGISTER_SUBMIT", username);
    try {
      await AuthAPI.register({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm,
        first_name: firstName,
        last_name: lastName,
      });
      const login = await AuthAPI.login(username.trim(), password);
      setAuth({
        token: login.access,
        refreshToken: login.refresh,
        user: login.user,
      });
      success("Cuenta creada");
      console.log("REGISTER_SUCCESS", login.user?.username);
      if (typeof window !== "undefined") {
        window.location.href = "/app";
      }
    } catch (err: any) {
      const detail = err?.response?.data;
      let message = "No pudimos crear tu cuenta.";
      if (detail) {
        message = typeof detail === "string" ? detail : JSON.stringify(detail);
      }
      console.log("REGISTER_ERROR", message);
      error(message);
    }
  };

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
            Regístrate para empezar a coleccionar tus logros y administrar tus
            formularios fácilmente.
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
            <h2 className="text-3xl font-semibold text-gray-800">
              Crear cuenta
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Usa tus datos para iniciar en BadgeUp
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="firstName">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="lastName">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="passwordConfirm"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="passwordConfirm"
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Crear cuenta
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
