import type { Route } from "./+types/amigos";
import { useLoaderData, useRevalidator } from "react-router";
import { FriendsAPI, type Friend } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useConfirm } from "../ui/ConfirmProvider";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amigos | BadgeUp" },
    { name: "description", content: "Tus amigos" },
  ];
}

export async function loader({}: Route.LoaderArgs) {
  const friends = await FriendsAPI.list();
  return { friends };
}

export default function Amigos() {
  const { friends } = useLoaderData<typeof loader>() as { friends: Friend[] };
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const revalidator = useRevalidator();

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">Tus Amigos</h2>
          {!adding ? (
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition" onClick={() => setAdding(true)}>
              Agregar amigo
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                placeholder="Nombre"
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={async () => {
                  if (!name.trim()) { error("Nombre requerido"); return; }
                  await FriendsAPI.add(name.trim());
                  success("Amigo agregado");
                  setName("");
                  setAdding(false);
                  revalidator.revalidate();
                }}
              >
                Guardar
              </button>
              <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300" onClick={() => { setAdding(false); setName(""); }}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {friends.map((f) => (
            <div key={f.id} className="bg-white p-5 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition">
              <div className="flex items-center space-x-4">
                <img src={f.avatar || "https://i.pravatar.cc/80?img=1"} className="w-16 h-16 rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{f.name}</h3>
                  <p className="text-sm text-gray-500">{f.albums || 0} álbumes</p>
                  {f.status && <p className="text-xs text-green-600 font-medium">{f.status}</p>}
                </div>
              </div>
              <button
                className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                onClick={async () => {
                  const ok = await confirm({ title: "Eliminar", description: "Deseas eliminar este contacto", confirmText: "Eliminar", cancelText: "No" });
                  if (!ok) return;
                  const removed = await FriendsAPI.remove(f.id);
                  if (removed) { success("Se eliminó correctamente"); revalidator.revalidate(); } else { error("No se pudo eliminar"); }
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
