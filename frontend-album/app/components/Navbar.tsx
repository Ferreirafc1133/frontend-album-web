import { Link, NavLink } from "react-router";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-blue-600 ${isActive ? "text-blue-600" : "text-gray-700"}`;

  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-600">BadgeUp</Link>
      <ul className="flex space-x-6 font-medium">
        <li>
          <NavLink to="/" className={linkClass} end>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/albums" className={linkClass}>
            Mis Álbumes
          </NavLink>
        </li>
        <li>
          <NavLink to="/ranking" className={linkClass}>
            Ranking
          </NavLink>
        </li>
        <li>
          <NavLink to="/amigos" className={linkClass}>
            Amigos
          </NavLink>
        </li>
        <li>
          <NavLink to="/notificaciones" className={linkClass}>
            Notificaciones
          </NavLink>
        </li>
      </ul>
      <div className="flex items-center space-x-3">
        <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-10 h-10 rounded-full border" />
        <NavLink to="/profile" className={linkClass}>Fernando</NavLink>
      </div>
    </nav>
  );
}
