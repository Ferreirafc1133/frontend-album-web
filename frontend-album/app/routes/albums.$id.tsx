import type { Route } from "./+types/albums.$id";
import { Link, useParams, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
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
  const navigate = useNavigate();

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

  const [showEditAlbum, setShowEditAlbum] = useState(false);
  const [showCreateSticker, setShowCreateSticker] = useState(false);
  const [showEditStickerModal, setShowEditStickerModal] = useState(false);

  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumTheme, setAlbumTheme] = useState("");
  const [albumPrice, setAlbumPrice] = useState("");
  const [albumPremium, setAlbumPremium] = useState(false);
  const [albumCover, setAlbumCover] = useState<File | null>(null);
  const [savingAlbum, setSavingAlbum] = useState(false);

  const [matchPhotoFile, setMatchPhotoFile] = useState<File | null>(null);
  const [matching, setMatching] = useState(false);
  const captureInputRef = useRef<HTMLInputElement | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockedSticker, setUnlockedSticker] = useState<Sticker | null>(null);
  const [unlockNote, setUnlockNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const { error, success } = useToast();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      try {
        const data = await AlbumsAPI.get(id);
        if (mounted) setAlbum(data);
        if (mounted && data) {
          setAlbumTitle(data.title);
          setAlbumDescription(data.description || "");
          setAlbumTheme(data.theme || "");
          setAlbumPremium(!!data.is_premium);
          setAlbumPrice(data.price || "");
          setAlbumCover(null);
        }
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
      setShowCreateSticker(false);
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
    setShowEditStickerModal(true);
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
      setShowEditStickerModal(false);
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

  const handleMatchPhoto = async (fileParam?: File) => {
    const fileToUse = fileParam || matchPhotoFile;
    if (!album || !fileToUse) return;
    try {
      setMatching(true);

      const result = await AlbumsAPI.matchPhoto(album.id, fileToUse);

      // limpiar selección siempre
      setMatchPhotoFile(null);
      if (captureInputRef.current) {
        captureInputRef.current.value = "";
      }

      // no hubo match
      if (!result.unlocked) {
        const msg =
          result.message ||
          "No encontramos ningún sticker que coincida con esta foto.";
        error(msg);
        return;
      }

      const sticker = result.sticker;

      // refrescar en segundo plano
      AlbumsAPI.get(String(album.id))
        .then((updated) => setAlbum(updated))
        .catch((e) => console.error("REFETCH_ALBUM_ERROR", e));

      // ya estaba desbloqueado
      if (result.already_unlocked) {
        success(result.reason || "Ya habías desbloqueado este sticker.");
        if (sticker?.id) {
          navigate(`/app/stickers/${sticker.id}`);
        }
        setShowUnlockModal(false);
        setUnlockedSticker(null);
        setUnlockNote("");
        return;
      }

      // nuevo desbloqueo
      success(`Sticker desbloqueado: ${sticker?.name || "Sticker"}`);
      setUnlockedSticker(sticker || null);
      setShowUnlockModal(true);
      setUnlockNote("");
    } catch (err: any) {
      console.error("MATCH_PHOTO_ERROR", err?.response?.data || err);
      error("No pudimos procesar tu foto. Intenta de nuevo.");
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-500">Cargando álbum...</div>;
  }

  if (!album) {
    return <div className="p-10 text-red-500">Álbum no encontrado.</div>;
  }

  const cover =
    resolveMediaUrl(album.cover_image) ||
    "https://placehold.co/1200x320?text=Album";

  const totalStickers = album.stickers.length;
  const unlockedCount = album.stickers.filter(
    (s) => s.is_unlocked,
  ).length;
  const funFactModal =
    (unlockedSticker as any)?.fun_fact ||
    "Próximamente aquí aparecerá un dato curioso del modelo. Dejé listo el bloque para leerlo desde el backend (ej. campo fun_fact).";

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      {/* HERO TIPO MAQUETA AZUL */}
      <header className="bg-blue-600 text-white py-10 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 relative">
          {user?.is_staff && (
            <div className="absolute top-0 right-0 flex gap-2">
              <button
                className="text-xs bg-white/10 border border-white/30 px-3 py-1 rounded-lg hover:bg-white/20"
                onClick={() => setShowEditAlbum(true)}
                type="button"
              >
                Editar álbum
              </button>
              <button
                className="text-xs bg-white px-3 py-1 rounded-lg text-blue-700 hover:bg-blue-50"
                onClick={() => setShowCreateSticker(true)}
                type="button"
              >
                Nuevo sticker
              </button>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-center">
            {album.title}
          </h1>
          <p className="text-blue-100 text-sm">
            {unlockedCount}/{totalStickers} stickers desbloqueados
          </p>

          {!user?.is_staff && (
            <>
              <button
                type="button"
                disabled={matching}
                className="mt-2 inline-flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded-full shadow hover:bg-blue-50 disabled:opacity-60"
                onClick={() => captureInputRef.current?.click()}
              >
                <span>📸</span>
                <span>
                  {matching ? "Analizando..." : "Capturar Sticker"}
                </span>
              </button>
              <input
                ref={captureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setMatchPhotoFile(file);
                  if (file) {
                    handleMatchPhoto(file);
                  }
                }}
              />
            </>
          )}

          <img
            src={cover}
            alt={album.title}
            className="w-full max-w-4xl mx-auto rounded-xl mt-6 shadow-lg object-cover max-h-64"
          />
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1 py-10">
        {/* PROGRESO */}
        <section className="max-w-5xl mx-auto mb-10">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
            Tu progreso
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {album.stickers.map((sticker) => {
              const isLocked = sticker.is_unlocked === false;
              const showLockedState = isLocked && !user?.is_staff;

              return (
                <div
                  key={sticker.id}
                  className="flex flex-col items-center gap-1"
                >
                  <Link
                    to={`/app/stickers/${sticker.id}`}
                    className="inline-flex flex-col items-center gap-2 group"
                  >
                    <div className="relative">
                      {sticker.image_reference && (
                        <img
                          src={resolveMediaUrl(sticker.image_reference) || ""}
                          alt={sticker.name}
                          className={`h-20 md:h-24 w-auto object-contain transition-transform group-hover:-translate-y-1 ${
                            showLockedState ? "opacity-40 grayscale" : "drop-shadow"
                          }`}
                        />
                      )}
                      {showLockedState && (
                        <span className="absolute inset-0 flex items-center justify-center text-2xl">🔒</span>
                      )}
                    </div>
                  </Link>

                  <p className="text-xs md:text-sm text-center text-gray-700 max-w-[7rem] truncate">
                    {showLockedState ? "Desbloquear..." : sticker.name}
                  </p>

                  {user?.is_staff && (
                    <button
                      type="button"
                      className="text-[11px] text-blue-600 hover:underline"
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

        {/* DESCRIPCIÓN */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
            Descripción del Álbum
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {album.description ||
              "En este álbum podrás coleccionar stickers relacionados con este tema."}
          </p>
        </section>
      </main>

      {/* MODAL: NUEVO STICKER */}
      {user?.is_staff && showCreateSticker && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Nuevo sticker
              </h3>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreateSticker(false)}
                type="button"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="sticker-name"
                >
                  Nombre *
                </label>
                <input
                  id="sticker-name"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newSticker.name}
                  onChange={(e) =>
                    setNewSticker((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="sticker-points"
                >
                  Puntos
                </label>
                <input
                  id="sticker-points"
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newSticker.points}
                  onChange={(e) =>
                    setNewSticker((s) => ({ ...s, points: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="sticker-order"
                >
                  Orden
                </label>
                <input
                  id="sticker-order"
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newSticker.order}
                  onChange={(e) =>
                    setNewSticker((s) => ({ ...s, order: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="sticker-desc"
                >
                  Descripción
                </label>
                <textarea
                  id="sticker-desc"
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={newSticker.description}
                  onChange={(e) =>
                    setNewSticker((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="sticker-rarity"
                >
                  Rareza
                </label>
                <input
                  id="sticker-rarity"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="común, raro..."
                  value={newSticker.rarity}
                  onChange={(e) =>
                    setNewSticker((s) => ({ ...s, rarity: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm text-gray-700 mb-1"
                htmlFor="sticker-image"
              >
                Imagen *
              </label>
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
                <p className="text-xs text-gray-500 mt-1">
                  Seleccionado: {newSticker.image.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                onClick={() => setShowCreateSticker(false)}
              >
                Cancelar
              </button>
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
        </div>
      )}

      {/* MODAL: EDITAR STICKER */}
      {user?.is_staff && showEditStickerModal && editingSticker && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Editar sticker
              </h3>
              <button
                className="text-sm text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setShowEditStickerModal(false);
                  setEditingSticker(null);
                }}
                type="button"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="edit-sticker-name"
                >
                  Nombre *
                </label>
                <input
                  id="edit-sticker-name"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingData.name}
                  onChange={(e) =>
                    setEditingData((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="edit-sticker-points"
                >
                  Puntos
                </label>
                <input
                  id="edit-sticker-points"
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingData.points}
                  onChange={(e) =>
                    setEditingData((s) => ({ ...s, points: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="edit-sticker-order"
                >
                  Orden
                </label>
                <input
                  id="edit-sticker-order"
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={editingData.order}
                  onChange={(e) =>
                    setEditingData((s) => ({ ...s, order: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="edit-sticker-desc"
                >
                  Descripción
                </label>
                <textarea
                  id="edit-sticker-desc"
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={editingData.description}
                  onChange={(e) =>
                    setEditingData((s) => ({
                      ...s,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm text-gray-700 mb-1"
                  htmlFor="edit-sticker-rarity"
                >
                  Rareza
                </label>
                <input
                  id="edit-sticker-rarity"
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="común, raro..."
                  value={editingData.rarity}
                  onChange={(e) =>
                    setEditingData((s) => ({ ...s, rarity: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm text-gray-700 mb-1"
                htmlFor="edit-sticker-image"
              >
                Imagen (opcional)
              </label>
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
                <p className="text-xs text-gray-500 mt-1">
                  Seleccionado: {editingData.image.name}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setShowEditStickerModal(false);
                  setEditingSticker(null);
                }}
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
        </div>
      )}

      {/* MODAL: EDITAR ÁLBUM (IGUAL QUE YA TENÍAS) */}
      {user?.is_staff && showEditAlbum && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Editar álbum
              </h3>
              <button
                onClick={() => setShowEditAlbum(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Cerrar
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="album-title"
                  >
                    Título *
                  </label>
                  <input
                    id="album-title"
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="album-theme"
                  >
                    Tema
                  </label>
                  <input
                    id="album-theme"
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={albumTheme}
                    onChange={(e) => setAlbumTheme(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="album-description"
                >
                  Descripción
                </label>
                <textarea
                  id="album-description"
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  placeholder="Describe el álbum"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <label className="flex items-center gap-3 text-gray-700">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-600"
                    checked={albumPremium}
                    onChange={(e) => setAlbumPremium(e.target.checked)}
                  />
                  <span>Es premium</span>
                </label>
                <div>
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="album-price"
                  >
                    Precio (opcional)
                  </label>
                  <input
                    id="album-price"
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={albumPrice}
                    onChange={(e) => setAlbumPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  className="block text-gray-700 mb-2"
                  htmlFor="album-cover"
                >
                  Portada (opcional)
                </label>
                <input
                  id="album-cover"
                  type="file"
                  accept="image/*"
                  className="w-full"
                  onChange={(e) => setAlbumCover(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {albumCover
                    ? `Archivo seleccionado: ${albumCover.name}`
                    : "Si no cargas archivo, se mantiene la portada actual."}
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
                  onClick={() => {
                    setShowEditAlbum(false);
                    setAlbumCover(null);
                    setAlbumTitle(album.title);
                    setAlbumDescription(album.description || "");
                    setAlbumTheme(album.theme || "");
                    setAlbumPremium(!!album.is_premium);
                    setAlbumPrice(album.price || "");
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingAlbum}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  onClick={async () => {
                    if (!album) return;
                    setSavingAlbum(true);
                    try {
                      await AlbumsAPI.update(album.id, {
                        title: albumTitle.trim(),
                        description: albumDescription.trim(),
                        theme: albumTheme.trim(),
                        is_premium: albumPremium,
                        price: albumPrice.trim() || null,
                        cover_image: albumCover || undefined,
                      });
                      const updated = await AlbumsAPI.get(String(album.id));
                      setAlbum(updated);
                      success("Álbum actualizado");
                      setShowEditAlbum(false);
                      setAlbumCover(null);
                    } catch (err: any) {
                      console.error(
                        "ALBUM_UPDATE_MODAL_ERROR",
                        err?.response?.data || err,
                      );
                      error("No pudimos actualizar el álbum.");
                    } finally {
                      setSavingAlbum(false);
                    }
                  }}
                >
                  {savingAlbum ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUnlockModal && unlockedSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-xl bg-[#f5f9ff] rounded-3xl shadow-2xl overflow-hidden">
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_10%_20%,#ffd7d7_0,#ffd7d700_45%),radial-gradient(circle_at_80%_30%,#d1f4ff_0,#d1f4ff00_45%),radial-gradient(circle_at_30%_80%,#e4ffd1_0,#e4ffd100_45%)]" />
            <div className="relative p-8 flex flex-col items-center gap-6">
              {unlockedSticker.image_reference && (
                <img
                  src={resolveMediaUrl(unlockedSticker.image_reference) || ""}
                  alt={unlockedSticker.name}
                  className="max-h-56 w-auto rounded-2xl shadow-lg object-contain"
                />
              )}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-blue-700">¡Sticker desbloqueado!</h2>
                <p className="text-xl font-semibold text-gray-900">{unlockedSticker.name}</p>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Has conseguido este sticker al capturar una foto real validada por nuestro equipo de philipinos en vivo. ¡Otro paso más para completar tu álbum de{" "}
                  <span className="font-semibold">{album.title}</span>! 🚗✨
                </p>
              </div>
              <div className="w-full max-w-md mt-2 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
                <span className="text-yellow-500 text-xl">💡</span>
                <p className="text-sm text-yellow-900">
                  {funFactModal}
                </p>
              </div>
              <div className="w-full max-w-md">
                <label className="block text-sm font-semibold text-gray-800 mb-2" htmlFor="unlock-note">
                  ¿Cómo encontraste este logro?
                </label>
                <textarea
                  id="unlock-note"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={unlockNote}
                  onChange={(e) => setUnlockNote(e.target.value)}
                  placeholder="Comparte cómo conseguiste este sticker..."
                />
              </div>
              <button
                type="button"
                disabled={savingNote || !unlockNote.trim()}
                onClick={() => {
                  if (!unlockedSticker) return;
                  setSavingNote(true);
                  StickersAPI.saveMessage(unlockedSticker.id, unlockNote.trim())
                    .then(() => {
                      setUnlockedSticker({ ...unlockedSticker, user_message: unlockNote.trim() } as Sticker);
                      success("Mensaje guardado");
                      setShowUnlockModal(false);
                      setUnlockNote("");
                      return AlbumsAPI.get(String(album.id));
                    })
                    .then((updated) => {
                      if (updated) setAlbum(updated);
                    })
                    .catch((err) => {
                      console.error("SAVE_MESSAGE_ERROR", err?.response?.data || err);
                      error("No pudimos guardar tu mensaje.");
                    })
                    .finally(() => setSavingNote(false));
                }}
                className="mt-2 bg-white text-blue-700 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-50 shadow-md disabled:opacity-50 border border-blue-100"
              >
                {savingNote ? "Guardando..." : "Guardar mensaje"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockedSticker(null);
                  setUnlockNote("");
                }}
                className="mt-2 mb-1 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-700 shadow-md"
              >
                ← Volver al Álbum
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
