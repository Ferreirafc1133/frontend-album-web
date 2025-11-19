import type { Route } from "./+types/amigos";
import { useEffect, useState } from "react";
import { FriendsAPI, type ApiUser, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amigos | BadgeUp" },
    { name: "description", content: "Contactos y compañeros" },
  ];
}

export default function Amigos() {
  const [friends, setFriends] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await FriendsAPI.list(20);
        if (active) setFriends(data);
      } catch {
        if (active) error("No pudimos cargar la información.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [error]);

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Comunidad BadgeUp</h2>
          <p className="text-sm text-gray-500">{friends.length} usuarios destacados</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-500 col-span-3">Cargando...</p>
          ) : friends.length === 0 ? (
            <p className="text-gray-500 col-span-3">No hay usuarios registrados todavía.</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 hover:shadow-lg transition">
                <img
                  src={resolveMediaUrl(friend.avatar) || "https://i.pravatar.cc/120?u=badgeup"}
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {friend.first_name || friend.username} {friend.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{friend.points} puntos</p>
                  <p className="text-xs text-gray-400">{friend.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
