import type { Route } from "./+types/albums.$id";
import { useLoaderData, useRevalidator, useNavigate } from "react-router";
import { AlbumsAPI, type Album } from "../services/api";
import { useToast } from "../ui/ToastProvider";
import { useConfirm } from "../ui/ConfirmProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Álbum | Autos Clásicos" },
    { name: "description", content: "Detalle de álbum" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id as string;
  const album = await AlbumsAPI.get(id);
  return { album, id };
}

export default function AlbumDetail() {
  const { album, id } = useLoaderData<typeof loader>() as { album?: Album; id: string };
  const { success } = useToast();
  const { confirm } = useConfirm();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white py-10 px-8 text-center shadow-md">
        <h2 className="text-3xl font-bold mb-2">{album?.title || "Álbum"}</h2>
        <p className="text-blue-100">{album?.progress || "0/0"} stickers desbloqueados</p>
        <button
          className="mt-4 bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg hover:bg-blue-100 transition"
          onClick={async () => {
            const ok = await confirm({
              title: "Capturar sticker",
              description: "Deseas capturar un nuevo sticker",
              confirmText: "Capturar",
              cancelText: "No",
            });
            if (!ok) return;
            await AlbumsAPI.captureSticker(id);
            success("Sticker capturado");
            revalidator.revalidate();
            navigate("/desbloqueo");
          }}
        >
          Capturar Sticker
        </button>
      </header>

      <main className="flex-1 p-10">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">Tu progreso</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-white rounded-lg shadow-md flex items-center justify-center border-4 border-green-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/741/741407.png"
                alt="Sticker"
                className="w-14"
              />
            </div>
            <p className="mt-2 text-gray-700 text-sm font-medium">Camaro 1969</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-gray-200 rounded-lg shadow-inner flex items-center justify-center">
              <span className="text-gray-500 text-sm">Bloqueado</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm font-medium">Desbloquear...</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-gray-200 rounded-lg shadow-inner flex items-center justify-center">
              <span className="text-gray-500 text-sm">Bloqueado</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm font-medium">Desbloquear...</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-white rounded-lg shadow-md flex items-center justify-center border-4 border-green-500">
              <img
                src="https://cdn-icons-png.flaticon.com/512/201/201623.png"
                alt="Sticker"
                className="w-14"
              />
            </div>
            <p className="mt-2 text-gray-700 text-sm font-medium">Mustang GT</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-gray-200 rounded-lg shadow-inner flex items-center justify-center">
              <span className="text-gray-500 text-sm">Bloqueado</span>
            </div>
            <p className="mt-2 text-gray-400 text-sm font-medium">Desbloquear...</p>
          </div>
        </div>

        <section className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Descripción del Álbum</h3>
          <p className="text-gray-600 leading-relaxed max-w-3xl">
            En este álbum podrás coleccionar los modelos más icónicos de autos clásicos. Cada sticker se desbloquea al tomar una fotografía real de un vehículo con las características del modelo indicado, validada por IA y ubicación GPS.
          </p>
        </section>
      </main>
    </div>
  );
}
