import { Link, NavLink, useNavigate } from "react-router";
import { useUserStore } from "../store/useUserStore";
import { AuthAPI } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-blue-600 ${isActive ? "text-blue-600" : "text-gray-700"}`;
  const { user, logout, setUser } = useUserStore();
  const navigate = useNavigate();
  const { success } = useToast();

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
        {user ? (
          <>
            <img src="https://i.pravatar.cc/40" alt="Avatar" className="w-10 h-10 rounded-full border" />
            <NavLink to="/profile" className={linkClass}>{user.name || "Perfil"}</NavLink>
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={async () => {
                await AuthAPI.logout();
                logout();
                setUser(null);
                success("Sesión cerrada");
                navigate("/login");
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <NavLink to="/login" className={linkClass}>Entrar</NavLink>
        )}
      </div>
    </nav>
  );
}
