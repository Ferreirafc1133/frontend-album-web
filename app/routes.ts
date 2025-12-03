import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/login.tsx", { id: "routes/root-login" }),

  route("login", "routes/login.tsx", { id: "routes/login-page" }),
  route("registro", "routes/registro.tsx"),
  route("contra", "routes/contra.tsx"),

  route("app", "routes/_protected.tsx", [
    index("routes/home.tsx"),

    route("albums", "routes/albums.tsx"),
    route("albums/create", "routes/albums.create.tsx"),
    route("albums/:id", "routes/albums.$id.tsx"),
    route("albums/edit/:id", "routes/albums.edit.$id.tsx"),

    route("profile", "routes/profile.tsx"),
    route("profile/edit", "routes/profile.edit.tsx"),

    route("amigos", "routes/amigos.tsx"),
    route("desbloqueo", "routes/desbloqueo.tsx"),
    route("notificaciones", "routes/notificaciones.tsx"),
    route("ranking", "routes/ranking.tsx"),
    route("usuarios/:id", "routes/usuarios.$id.tsx"),
    route("mapa", "routes/mapa.tsx"),
    route("chat/:id", "routes/chat.$id.tsx"),
    route("calendario", "routes/calendario.tsx"),

    route("stickers/:sid", "routes/stickers.$sid.tsx"),
  ]),
] satisfies RouteConfig;
