import type { Route } from "./+types/albums.create";
import { useState, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router";
import { AlbumsAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crear Álbum" },
    { name: "description", content: "Administración de álbumes" },
  ];
}

export default function CreateAlbum() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [price, setPrice] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCover(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("El título es obligatorio.");
      return;
    }
    setSaving(true);
    try {
      await AlbumsAPI.create({
        title: title.trim(),
        description: description.trim() || undefined,
        theme: theme.trim() || undefined,
        is_premium: isPremium,
        price: price.trim() || null,
        cover_image: cover || undefined,
      });
      success("Álbum creado");
      navigate("/app/albums");
    } catch (err: any) {
      const detail = err?.response?.data;
      let message = "No pudimos crear el álbum.";
      if (detail) {
        message = typeof detail === "string" ? detail : JSON.stringify(detail);
      }
      error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-8 container mx-auto max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">Crear álbum</h1>
        <Link to="/app/albums" className="text-blue-600 hover:underline text-sm">
          Volver al listado
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="title">Título *</label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del álbum"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="theme">Tema</label>
              <input
                id="theme"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ej. Deportes, Viajes..."
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="description">Descripción</label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega detalles del álbum"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="cover">Portada (opcional)</label>
            <input
              id="cover"
              type="file"
              accept="image/*"
              className="w-full"
              onChange={handleCoverChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              {cover ? `Archivo seleccionado: ${cover.name}` : "Formatos de imagen soportados."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center gap-3 text-gray-700">
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-600"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
              />
              <span>Es premium</span>
            </label>
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="price">
                Precio (opcional)
              </label>
              <input
                id="price"
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Link
              to="/app/albums"
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Crear álbum"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
