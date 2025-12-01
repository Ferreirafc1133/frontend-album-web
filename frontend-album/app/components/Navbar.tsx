import { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useUserStore } from "../store/useUserStore";
import { AuthAPI, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";

export default function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `hover:text-blue-600 ${isActive ? "text-blue-600" : "text-gray-700"}`;
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const token = useUserStore((state) => state.token);
  const fetchProfile = useUserStore((state) => state.fetchProfile);
  const loadingProfile = useUserStore((state) => state.loadingProfile);
  const navigate = useNavigate();
  const { success } = useToast();

  useEffect(() => {
    if (token && !user && !loadingProfile) {
      console.log("NAVBAR_FETCH_PROFILE");
      fetchProfile().catch(() => {
        console.log("NAVBAR_FETCH_PROFILE_ERROR");
        logout();
        navigate("/");
      });
    }
  }, [token, user, loadingProfile, fetchProfile, logout, navigate]);

  const avatar = resolveMediaUrl(user?.avatar) || "https://www.gravatar.com/avatar/?d=mp&f=y&s=80";

  if (!token) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md py-4 px-8 flex justify-between items-center">
      <Link to="/app" className="text-2xl font-bold text-blue-600">BadgeUp</Link>
      <ul className="flex space-x-6 font-medium">
        <li>
          <NavLink to="/app" className={linkClass} end>
            Inicio
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/albums" className={linkClass}>
            Mis Álbumes
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/ranking" className={linkClass}>
            Ranking
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/calendario" className={linkClass}>
            Calendario
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/mapa" className={linkClass}>
            Mapa
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/amigos" className={linkClass}>
            Amigos
          </NavLink>
        </li>
        <li>
          <NavLink to="/app/notificaciones" className={linkClass}>
            Notificaciones
          </NavLink>
        </li>
      </ul>
      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full border object-cover" />
            <NavLink to="/app/profile" className={linkClass}>
              {user.first_name || user.username || "Perfil"}
            </NavLink>
            <button
              className="px-3 py-1 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={async () => {
                await AuthAPI.logout();
                logout();
                success("Sesión cerrada");
                navigate("/");
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <span className="text-gray-500 text-sm">Cargando perfil...</span>
        )}
      </div>
    </nav>
  );
}
