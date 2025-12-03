import type { Route } from "./+types/profile.edit";
import { Link } from "react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import { useUserStore } from "../store/useUserStore";
import { AuthAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Editar Perfil | BadgeUp" },
    { name: "description", content: "Editar perfil de usuario" },
  ];
}

export default function EditProfile() {
  const user = useUserStore((state) => state.user);
  const setAuth = useUserStore((state) => state.setAuth);
  const token = useUserStore((state) => state.token);
  const refreshToken = useUserStore((state) => state.refreshToken);
  const { success, error } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isStaff, setIsStaff] = useState<boolean>(user?.is_staff || false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) {
    return <div className="p-10 text-gray-500">Cargando perfil...</div>;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        bio,
      };
      if (avatarFile) {
        payload.avatar = avatarFile;
      }
      if (user?.is_staff) {
        payload.is_staff = isStaff;
      }

      const updated = await AuthAPI.updateProfile(payload);
      setAuth({ token, refreshToken, user: updated });
      success("Perfil actualizado");
    } catch {
      error("No pudimos actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Editar perfil</h1>
        <Link to="/app/profile" className="text-blue-600 hover:underline">Volver</Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                disabled
                value={user.username}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos algo sobre ti"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="avatar">Foto de perfil</label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {avatarFile ? `Archivo seleccionado: ${avatarFile.name}` : "Sube una imagen para reemplazar tu foto."}
            </p>
          </div>

          {user.is_staff && (
            <div className="flex items-center gap-3">
              <input
                id="isStaff"
                type="checkbox"
                className="w-5 h-5 accent-blue-600"
                checked={isStaff}
                onChange={(e) => setIsStaff(e.target.checked)}
              />
              <label htmlFor="isStaff" className="text-gray-700">
                Marcar como administrador (solo visible para admins)
              </label>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Link to="/app/profile" className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300">Cancelar</Link>
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
