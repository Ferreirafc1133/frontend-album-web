import type { Route } from "./+types/albums.create";
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router";
import { AlbumsAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crear Álbum" },
    { name: "description", content: "Crear nuevo álbum" },
  ];
}

export default function CreateAlbum() {
  const [title, setTitle] = useState("");
  const [cover, setCover] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { success, error } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("Título requerido");
      return;
    }
    const album = await AlbumsAPI.create({ title, cover, description, progress: "0/10" });
    success("Se creó correctamente");
    navigate(`/albums/${album.id}`);
  };

  return (
    <main className="p-8 container mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Crear álbum</h1>
      <form className="bg-white rounded-xl shadow-md p-6 space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="title">Título</label>
          <input id="title" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="cover">Imagen de portada (URL)</label>
          <input id="cover" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={cover} onChange={(e) => setCover(e.target.value)} />
        </div>
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="description">Descripción</label>
          <textarea id="description" rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300" onClick={() => navigate(-1)}>Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Crear</button>
        </div>
      </form>
    </main>
  );
}
