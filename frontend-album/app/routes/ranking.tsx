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
        const data = await FriendsAPI.members();
        const score = (user: ApiUser) => user.computed_points ?? 0;
        const sorted = [...data].sort((a, b) => score(b) - score(a));
        if (mounted) setLeaders(sorted.slice(0, 50));
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

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {loading ? (
            <p className="text-gray-500 col-span-3">Cargando...</p>
          ) : leaders.slice(0, 3).map((user, idx) => {
            const podiumColors = ["bg-yellow-100 border-yellow-300", "bg-gray-100 border-gray-300", "bg-orange-100 border-orange-300"];
            const color = podiumColors[idx] || "bg-white";
            return (
              <div
                key={user.id}
                className={`rounded-2xl shadow-md p-6 flex flex-col items-center text-center border ${color} hover:shadow-lg transition`}
              >
                <div className="text-4xl font-black text-blue-600 mb-3">#{idx + 1}</div>
                <img
                  src={resolveMediaUrl(user.avatar) || "https://i.pravatar.cc/100?u=leader"}
                  alt={user.username}
                  className="w-20 h-20 rounded-full border-4 border-white shadow"
                />
                <h3 className="text-lg font-semibold text-gray-900 mt-3">
                  {user.first_name || user.username} {user.last_name}
                </h3>
                <p className="text-sm text-gray-600">{user.computed_points ?? 0} puntos</p>
              </div>
            );
          })}
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
                  <td className="py-3 px-5">{user.computed_points ?? 0}</td>
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
