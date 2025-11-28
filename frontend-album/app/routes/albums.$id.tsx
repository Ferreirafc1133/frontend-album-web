import type { Route } from "./+types/albums.$id";
import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  AlbumsAPI,
  type AlbumDetail,
  type Sticker,
  resolveMediaUrl,
  StickersAPI,
} from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useUserStore } from "../store/useUserStore";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Álbum | BadgeUp" },
    { name: "description", content: "Detalle del álbum" },
  ];
}

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingSticker, setCreatingSticker] = useState(false);
  const [newSticker, setNewSticker] = useState({
    name: "",
    description: "",
    points: "",
    order: "",
    rarity: "",
    image: null as File | null,
  });
  const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);
  const [editingData, setEditingData] = useState({
    name: "",
    description: "",
    points: "",
    order: "",
    rarity: "",
    image: null as File | null,
  });
  const [updatingSticker, setUpdatingSticker] = useState(false);
  const [matchPhotoFile, setMatchPhotoFile] = useState<File | null>(null);
  const [matching, setMatching] = useState(false);
  const { error, success } = useToast();
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        const data = await AlbumsAPI.get(id);
        if (mounted) setAlbum(data);
      } catch {
        if (mounted) error("No pudimos cargar el álbum.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, error]);

  const handleCreateSticker = async () => {
    if (!album) return;
    if (!user?.is_staff) {
      error("Solo administradores pueden crear stickers.");
      return;
    }
    if (!newSticker.name.trim()) {
      error("El nombre del sticker es obligatorio.");
      return;
    }
    if (!newSticker.image) {
      error("Debes subir la imagen del sticker.");
      return;
    }
    setCreatingSticker(true);
    try {
      await StickersAPI.create({
        album: album.id,
        name: newSticker.name.trim(),
        description: newSticker.description.trim() || undefined,
        points: newSticker.points ? Number(newSticker.points) : undefined,
        order: newSticker.order ? Number(newSticker.order) : undefined,
        rarity: newSticker.rarity || undefined,
        image: newSticker.image,
      });
      success("Sticker creado");
      const data = await AlbumsAPI.get(id as string);
      setAlbum(data);
      setNewSticker({
        name: "",
        description: "",
        points: "",
        order: "",
        rarity: "",
        image: null,
      });
    } catch (err: any) {
      const detail = err?.response?.data;
      let message = "No se pudo crear el sticker.";
      if (detail) {
        message = typeof detail === "string" ? detail : JSON.stringify(detail);
      }
      error(message);
    } finally {
      setCreatingSticker(false);
    }
  };

  const startEditSticker = (sticker: Sticker) => {
    setEditingSticker(sticker);
    setEditingData({
      name: sticker.name || "",
      description: sticker.description || "",
      points: sticker.reward_points != null ? String(sticker.reward_points) : "",
      order: sticker.order != null ? String(sticker.order) : "",
      rarity: sticker.rarity || "",
      image: null,
    });
  };

  const handleUpdateSticker = async () => {
    if (!editingSticker || !user?.is_staff) return;
    if (!editingData.name.trim()) {
      error("El nombre del sticker es obligatorio.");
      return;
    }
    setUpdatingSticker(true);
    try {
      await StickersAPI.update(editingSticker.id, {
        name: editingData.name.trim(),
        description: editingData.description.trim(),
        points: editingData.points ? Number(editingData.points) : undefined,
        order: editingData.order ? Number(editingData.order) : undefined,
        rarity: editingData.rarity || undefined,
        image: editingData.image || undefined,
      });
      success("Sticker actualizado");
      const data = await AlbumsAPI.get(id as string);
      setAlbum(data);
      setEditingSticker(null);
      setEditingData({
        name: "",
        description: "",
        points: "",
        order: "",
        rarity: "",
        image: null,
      });
    } catch (err: any) {
      const detail = err?.response?.data;
      let message = "No se pudo actualizar el sticker.";
      if (detail) {
        message = typeof detail === "string" ? detail : JSON.stringify(detail);
      }
      error(message);
    } finally {
      setUpdatingSticker(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-500">Cargando álbum...</div>;
  }

  if (!album) {
    return <div className="p-10 text-red-500">Álbum no encontrado.</div>;
  }

  const cover = resolveMediaUrl(album.cover_image) || "https://placehold.co/1200x320?text=Album";

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <header className="text-white py-10 px-8 shadow-md" style={{ backgroundColor: "#0d47a1" }}>
        <h2 className="text-3xl font-bold mb-2">{album.title}</h2>
        <p className="text-blue-100">{album.theme || "Sin tema"}</p>
        <img src={cover} alt={album.title} className="w-full max-w-4xl mx-auto rounded-xl mt-6 shadow-lg" />
      </header>

      <main className="flex-1 p-10 space-y-10">
        <section>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Descripción</h3>
          <p className="text-gray-600 leading-relaxed max-w-4xl">{album.description || "Este álbum aún no tiene descripción."}</p>
        </section>

        {!user?.is_staff && (
          <section className="bg-white rounded-xl shadow p-6 mb-6 max-w-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Desbloquear con foto</h3>
            <p className="text-sm text-gray-600 mb-3">
              Sube una foto real de tu coche. Usamos IA para identificar el modelo y ver si coincide con algún sticker de este álbum.
            </p>

            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setMatchPhotoFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-600">
                {matchPhotoFile ? `Archivo seleccionado: ${matchPhotoFile.name}` : "Aún no seleccionas un archivo."}
              </p>
              <button
                type="button"
                disabled={!matchPhotoFile || matching}
                onClick={async () => {
                  if (!album || !matchPhotoFile) return;
                  try {
                    setMatching(true);
                    const result = await AlbumsAPI.matchPhoto(album.id, matchPhotoFile);

                    if (!result.unlocked) {
                      const msg =
                        result.message ||
                        "No encontramos ningún sticker que coincida con esta foto.";
                      error(msg);
                    } else {
                      success(`Sticker desbloqueado: ${result.sticker?.name || "Sticker"}`);
                      const updated = await AlbumsAPI.get(String(album.id));
                      setAlbum(updated);
                    }
                  } catch (err: any) {
                    console.error("MATCH_PHOTO_ERROR", err?.response?.data || err);
                    error("No pudimos procesar tu foto. Intenta de nuevo.");
                  } finally {
                    setMatching(false);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {matching ? "Analizando..." : "Subir foto y buscar sticker"}
              </button>
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">Stickers</h3>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">{album.stickers.length} disponibles</p>
              {user?.is_staff && (
                <button
                  className="text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    const form = document.getElementById("sticker-create-form");
                    form?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Agregar sticker
                </button>
              )}
            </div>
          </div>
          {user?.is_staff && (
            <div id="sticker-create-form" className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Nuevo sticker</h4>
                <span className="text-sm text-gray-500">Solo admins</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="sticker-name">Nombre *</label>
                  <input
                    id="sticker-name"
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSticker.name}
                    onChange={(e) => setNewSticker((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="sticker-points">Puntos</label>
                  <input
                    id="sticker-points"
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSticker.points}
                    onChange={(e) => setNewSticker((s) => ({ ...s, points: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="sticker-order">Orden</label>
                  <input
                    id="sticker-order"
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={newSticker.order}
                    onChange={(e) => setNewSticker((s) => ({ ...s, order: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="sticker-desc">Descripción</label>
                  <textarea
                    id="sticker-desc"
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    value={newSticker.description}
                    onChange={(e) => setNewSticker((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="sticker-rarity">Rareza</label>
                  <input
                    id="sticker-rarity"
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="común, raro..."
                    value={newSticker.rarity}
                    onChange={(e) => setNewSticker((s) => ({ ...s, rarity: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="sticker-image">Imagen *</label>
                <input
                  id="sticker-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewSticker((s) => ({
                      ...s,
                      image: e.target.files?.[0] || null,
                    }))
                  }
                />
                {newSticker.image && (
                  <p className="text-xs text-gray-500 mt-1">Seleccionado: {newSticker.image.name}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCreateSticker}
                  disabled={creatingSticker}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {creatingSticker ? "Guardando..." : "Crear sticker"}
                </button>
              </div>
            </div>
          )}
          {user?.is_staff && editingSticker && (
            <div className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Editar sticker</h4>
                <button
                  className="text-sm text-gray-500 hover:text-gray-700"
                  onClick={() => setEditingSticker(null)}
                  type="button"
                >
                  Cerrar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="edit-sticker-name">Nombre *</label>
                  <input
                    id="edit-sticker-name"
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    value={editingData.name}
                    onChange={(e) => setEditingData((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="edit-sticker-points">Puntos</label>
                  <input
                    id="edit-sticker-points"
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={editingData.points}
                    onChange={(e) => setEditingData((s) => ({ ...s, points: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="edit-sticker-order">Orden</label>
                  <input
                    id="edit-sticker-order"
                    type="number"
                    className="w-full border rounded-lg px-3 py-2"
                    value={editingData.order}
                    onChange={(e) => setEditingData((s) => ({ ...s, order: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="edit-sticker-desc">Descripción</label>
                  <textarea
                    id="edit-sticker-desc"
                    className="w-full border rounded-lg px-3 py-2"
                    rows={2}
                    value={editingData.description}
                    onChange={(e) => setEditingData((s) => ({ ...s, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1" htmlFor="edit-sticker-rarity">Rareza</label>
                  <input
                    id="edit-sticker-rarity"
                    type="text"
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="común, raro..."
                    value={editingData.rarity}
                    onChange={(e) => setEditingData((s) => ({ ...s, rarity: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1" htmlFor="edit-sticker-image">Imagen (opcional)</label>
                <input
                  id="edit-sticker-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditingData((s) => ({
                      ...s,
                      image: e.target.files?.[0] || null,
                    }))
                  }
                />
                {editingData.image && (
                  <p className="text-xs text-gray-500 mt-1">Seleccionado: {editingData.image.name}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  onClick={() => setEditingSticker(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateSticker}
                  disabled={updatingSticker}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {updatingSticker ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 place-items-center">
            {album.stickers.map((sticker) => {
              const isLocked = sticker.is_unlocked === false;
              const showLockedState = isLocked && !user?.is_staff;

              return (
                <div key={sticker.id} className="inline-flex flex-col items-center gap-1">
                  <Link
                    to={`/app/stickers/${sticker.id}`}
                    className="relative inline-flex items-center justify-center h-32 md:h-40 w-32 md:w-40"
                  >
                    {/* Imagen real solo visible para admins o desbloqueados */}
                    {sticker.image_reference && (
                      <img
                        src={resolveMediaUrl(sticker.image_reference) || ""}
                        alt={sticker.name}
                        className={
                          showLockedState
                            ? "h-full w-full object-contain opacity-0"
                            : "h-full w-full object-contain"
                        }
                      />
                    )}

                    {/* Overlay de bloqueado solo para no-admins con sticker bloqueado */}
                    {showLockedState && (
                      <>
                        <div className="absolute inset-0 rounded-lg bg-black/90 pointer-events-none" />
                        <img
                          src="/bloqueado.png"
                          alt="Sticker bloqueado"
                          className="pointer-events-none absolute w-36 md:w-44 rotate-6 drop-shadow-xl"
                        />
                      </>
                    )}
                  </Link>

                  {user?.is_staff && (
                    <button
                      type="button"
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => startEditSticker(sticker)}
                    >
                      Editar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
