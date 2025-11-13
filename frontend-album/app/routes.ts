import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/albums", "routes/albums.tsx"),
  route("/albums/create", "routes/albums.create.tsx"),
  route("/albums/:id", "routes/albums.$id.tsx"),
  route("/albums/edit/:id", "routes/albums.edit.$id.tsx"),
  route("/login", "routes/login.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/profile/edit", "routes/profile.edit.tsx"),
  route("/amigos", "routes/amigos.tsx"),
  route("/contra", "routes/contra.tsx"),
  route("/desbloqueo", "routes/desbloqueo.tsx"),
  route("/notificaciones", "routes/notificaciones.tsx"),
  route("/ranking", "routes/ranking.tsx"),
  route("/registro", "routes/registro.tsx"),
  route("/sticker", "routes/sticker.tsx"),
] satisfies RouteConfig;
