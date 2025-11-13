export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">BadgeUp</h1>
      <ul className="flex space-x-6 text-gray-700 font-medium">
        <li><a href="#" className="hover:text-blue-600">Inicio</a></li>
        <li><a href="#" className="hover:text-blue-600">Mis Álbumes</a></li>
        <li><a href="#" className="hover:text-blue-600">Ranking</a></li>
        <li><a href="#" className="hover:text-blue-600">Amigos</a></li>
        <li><a href="#" className="hover:text-blue-600">Notificaciones</a></li>
      </ul>
      <div className="flex items-center space-x-3">
        <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-10 h-10 rounded-full border" />
        <span className="text-gray-700 font-medium">Fernando</span>
      </div>
    </nav>
  );
}

