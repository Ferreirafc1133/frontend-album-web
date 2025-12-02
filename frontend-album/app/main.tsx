import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./root";
import ProtectedLayout from "./routes/_protected";
import Login from "./routes/login";
import Registro from "./routes/registro";
import Contra from "./routes/contra";
import Home from "./routes/home";
import Albums from "./routes/albums";
import AlbumsCreate from "./routes/albums.create";
import AlbumDetail from "./routes/albums.$id";
import AlbumEdit from "./routes/albums.edit.$id";
import Amigos from "./routes/amigos";
import Desbloqueo from "./routes/desbloqueo";
import Notificaciones from "./routes/notificaciones";
import Ranking from "./routes/ranking";
import Profile from "./routes/profile";
import ProfileEdit from "./routes/profile.edit";
import StickerDetail from "./routes/stickers.$sid";
import Mapa from "./routes/mapa";
import UserProfile from "./routes/usuarios.$id";
import ChatPage from "./routes/chat.$id";
import Calendario from "./routes/calendario";
import "./app.css";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <Login /> },
      { path: "/login", element: <Login /> },
      { path: "/registro", element: <Registro /> },
      { path: "/contra", element: <Contra /> },
      {
        path: "/app",
        element: <ProtectedLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "albums", element: <Albums /> },
          { path: "albums/create", element: <AlbumsCreate /> },
          { path: "albums/:id", element: <AlbumDetail /> },
          { path: "albums/edit/:id", element: <AlbumEdit /> },
          { path: "profile", element: <Profile /> },
          { path: "profile/edit", element: <ProfileEdit /> },
          { path: "amigos", element: <Amigos /> },
          { path: "desbloqueo", element: <Desbloqueo /> },
          { path: "notificaciones", element: <Notificaciones /> },
          { path: "ranking", element: <Ranking /> },
          { path: "stickers/:sid", element: <StickerDetail /> },
          { path: "mapa", element: <Mapa /> },
          { path: "usuarios/:id", element: <UserProfile /> },
          { path: "chat/:id", element: <ChatPage /> },
          { path: "calendario", element: <Calendario /> },
        ],
      },
    ],
  },
]);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(<RouterProvider router={router} />);
}
