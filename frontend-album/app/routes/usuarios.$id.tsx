import type { Route } from "./+types/usuarios.$id";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { UsersAPI, type UserProfile, resolveMediaUrl } from "../services/api";
import { useUserStore } from "../store/useUserStore";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Perfil de usuario | BadgeUp" },
    { name: "description", content: "Perfil público y controles de admin" },
  ];
}

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminBusy, setAdminBusy] = useState(false);
  const currentUser = useUserStore((s) => s.user);
  const { error, success } = useToast();
  const navigate = useNavigate();

  const isAdmin = currentUser?.is_staff;
  const isSelf = currentUser?.id && Number(id) === currentUser.id;

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await UsersAPI.profile(id);
      setProfile(data);
    } catch {
      error("No pudimos cargar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAdminUpdate = async (payload: Partial<UserProfile> & { reset_avatar?: boolean }) => {
    if (!id) return;
    setAdminBusy(true);
    try {
      const data = await UsersAPI.adminUpdate(id, payload);
      setProfile(data);
      success("Perfil actualizado");
    } catch {
      error("No se pudo actualizar el usuario.");
    } finally {
      setAdminBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm("¿Eliminar usuario? Esta acción es permanente.");
    if (!confirmed) return;
    setAdminBusy(true);
    try {
      await UsersAPI.adminDelete(id);
      success("Usuario eliminado");
      navigate("/app/amigos");
    } catch {
      error("No se pudo eliminar el usuario.");
    } finally {
      setAdminBusy(false);
    }
  };

  const lastCaptures = useMemo(() => profile?.last_captures || [], [profile]);

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen p-10">
        <p className="text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-gray-100 min-h-screen p-10">
        <p className="text-gray-600">Perfil no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white shadow-sm pb-8">
        <div className="max-w-5xl mx-auto px-6 pt-10 relative">
          <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl mb-[-60px]" />
          <div className="relative flex items-center gap-6">
            <img
              src={resolveMediaUrl(profile.avatar) || "https://i.pravatar.cc/180?u=badgeup-user"}
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.first_name || profile.username} {profile.last_name}
                </h1>
                {profile.is_staff && (
                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">@{profile.username}</p>
              <div className="flex gap-4 text-sm text-gray-700 mt-2">
                <span>Pts: {profile.points}</span>
                <span>Stickers: {profile.stickers_captured}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Actividad reciente</h2>
          {lastCaptures.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin capturas recientes.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {lastCaptures.map((cap) => (
                <div
                  key={cap.id}
                  className="bg-white rounded-xl shadow p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{cap.sticker_name}</p>
                    <p className="text-xs text-gray-500">{cap.album_title}</p>
                    <p className="text-xs text-gray-400">
                      {cap.unlocked_at ? new Date(cap.unlocked_at).toLocaleString() : ""}
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    +{cap.reward_points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {isAdmin && !isSelf && (
          <section className="bg-white rounded-xl shadow p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Administrar usuario</h2>
              <span className="text-xs text-red-600 font-semibold">Modo admin</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleAdminUpdate({ is_staff: !profile.is_staff })}
                disabled={adminBusy}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                {profile.is_staff ? "Quitar rol admin" : "Convertir en admin"}
              </button>
              <button
                onClick={() => handleAdminUpdate({ reset_avatar: true })}
                disabled={adminBusy}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                Reset avatar
              </button>
              <button
                onClick={() => handleAdminUpdate({ points: Math.max(0, profile.points - 100) })}
                disabled={adminBusy}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm hover:bg-gray-300 disabled:opacity-50"
              >
                -100 puntos
              </button>
              <button
                onClick={() => handleAdminUpdate({ points: profile.points + 100 })}
                disabled={adminBusy}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
              >
                +100 puntos
              </button>
              <button
                onClick={handleDelete}
                disabled={adminBusy}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                Eliminar usuario
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
