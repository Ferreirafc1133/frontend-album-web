import { Link } from "react-router";
import type { AlbumSummary } from "../services/api";
import { resolveMediaUrl } from "../services/api";

type Props = {
  album: AlbumSummary;
};

export default function AlbumCard({ album }: Props) {
  const cover = resolveMediaUrl(album.cover_image) || "https://placehold.co/600x240?text=Album";
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img src={cover} alt={album.title} className="w-full h-40 object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800">{album.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          {album.theme || "Sin tema"} · {album.stickers_count} stickers
        </p>
        <Link
          to={`/app/albums/${album.id}`}
          className="block text-center bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700"
        >
          Ver álbum
        </Link>
      </div>
    </div>
  );
}
