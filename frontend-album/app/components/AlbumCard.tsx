import { Link } from "react-router";

type Album = {
  id?: string | number;
  cover: string;
  title: string;
  progress?: string;
};

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img src={album.cover} alt="" className="w-full h-40 object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800">{album.title}</h3>
        {album.progress ? (
          <p className="text-sm text-gray-500 mb-3">{album.progress}</p>
        ) : null}
        {album.id !== undefined ? (
          <Link to={`/albums/${album.id}`} className="block text-center bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">
            Ver álbum
          </Link>
        ) : (
          <div className="bg-blue-600 text-white w-full py-2 rounded-lg text-center">Ver álbum</div>
        )}
      </div>
    </div>
  );
}
