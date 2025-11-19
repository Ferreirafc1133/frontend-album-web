import type { Route } from "./+types/ranking";
import { useEffect, useState } from "react";
import { FriendsAPI, type ApiUser, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ranking | BadgeUp" },
    { name: "description", content: "Ranking global" },
  ];
}

export default function Ranking() {
  const [leaders, setLeaders] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await FriendsAPI.list(50);
        if (mounted) setLeaders(data);
      } catch {
        if (mounted) error("No pudimos cargar el ranking.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [error]);

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Ranking Global</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <p className="text-gray-500 col-span-3">Cargando...</p>
          ) : leaders.slice(0, 3).map((user, idx) => (
            <div key={user.id} className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
              <span className="text-3xl font-bold text-blue-600 mr-4">#{idx + 1}</span>
              <img
                src={resolveMediaUrl(user.avatar) || "https://i.pravatar.cc/100?u=leader"}
                alt={user.username}
                className="w-16 h-16 rounded-full border-2 border-blue-200 object-cover"
              />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {user.first_name || user.username} {user.last_name}
                </h3>
                <p className="text-sm text-gray-500">{user.points} puntos</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, user.points)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">Usuario</th>
                <th className="py-3 px-5">Correo</th>
                <th className="py-3 px-5">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr key={user.id} className="border-t">
                  <td className="py-3 px-5">{index + 1}</td>
                  <td className="py-3 px-5">{user.username}</td>
                  <td className="py-3 px-5">{user.email}</td>
                  <td className="py-3 px-5">{user.points}</td>
                </tr>
              ))}
              {!loading && leaders.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 px-5 text-center text-gray-500">
                    No hay usuarios en el ranking todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
