import type { Route } from "./+types/amigos";
import { useEffect, useMemo, useState } from "react";
import { FriendsAPI, type FriendRequest, type MemberUser, resolveMediaUrl } from "../services/api";
import { useToast } from "../ui/ToastProvider";

type TabKey = "community" | "friends" | "received" | "sent";

const tabLabels: Record<TabKey, string> = {
  community: "Comunidad",
  friends: "Mis amigos",
  received: "Solicitudes recibidas",
  sent: "Solicitudes enviadas",
};

const statusLabels: Record<string, string> = {
  none: "Agregar amigo",
  request_sent: "Solicitud enviada",
  request_received: "Solicitud recibida",
  friends: "Amigos",
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amigos | BadgeUp" },
    { name: "description", content: "Contactos y compañeros" },
  ];
}

export default function Amigos() {
  const [tab, setTab] = useState<TabKey>("community");
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [friends, setFriends] = useState<MemberUser[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<FriendRequest[]>([]);
  const [requestsSent, setRequestsSent] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { success, error } = useToast();

  const loadTab = async (nextTab: TabKey) => {
    setLoading(true);
    try {
      if (nextTab === "community") {
        const data = await FriendsAPI.members();
        setMembers(data);
      } else if (nextTab === "friends") {
        const data = await FriendsAPI.friends();
        setFriends(data);
      } else if (nextTab === "received") {
        const data = await FriendsAPI.requests("received", "pending");
        setRequestsReceived(data);
      } else if (nextTab === "sent") {
        const data = await FriendsAPI.requests("sent", "pending");
        setRequestsSent(data);
      }
    } catch {
      error("No pudimos cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  const refreshAll = async () => {
    try {
      const [m, f, r, s] = await Promise.all([
        FriendsAPI.members(),
        FriendsAPI.friends(),
        FriendsAPI.requests("received", "pending"),
        FriendsAPI.requests("sent", "pending"),
      ]);
      setMembers(m);
      setFriends(f);
      setRequestsReceived(r);
      setRequestsSent(s);
    } catch {
      error("No pudimos actualizar los datos.");
    }
  };

  useEffect(() => {
    loadTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSend = async (userId: number) => {
    try {
      await FriendsAPI.sendRequest(userId);
      success("Solicitud enviada");
      await refreshAll();
    } catch {
      error("No pudimos enviar la solicitud.");
    }
  };

  const handleAccept = async (requestId: number) => {
    try {
      await FriendsAPI.acceptRequest(requestId);
      success("Solicitud aceptada");
      await refreshAll();
    } catch {
      error("No pudimos aceptar la solicitud.");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await FriendsAPI.rejectRequest(requestId);
      success("Solicitud rechazada");
      await refreshAll();
    } catch {
      error("No pudimos rechazar la solicitud.");
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await FriendsAPI.cancelRequest(requestId);
      success("Solicitud cancelada");
      await refreshAll();
    } catch {
      error("No pudimos cancelar la solicitud.");
    }
  };

  const handleRemoveFriend = async (requestId: number) => {
    try {
      await FriendsAPI.removeFriend(requestId);
      success("Amigo eliminado");
      await refreshAll();
    } catch {
      error("No pudimos eliminar la amistad.");
    }
  };

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((m) => {
      const fullName = `${m.first_name || ""} ${m.last_name || ""} ${m.username}`.toLowerCase();
      return fullName.includes(term) || (m.email || "").toLowerCase().includes(term);
    });
  }, [members, search]);

  const renderStatusChip = (status: string) => {
    const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold";
    if (status === "friends") return <span className={`${base} bg-green-100 text-green-700`}>Amigos</span>;
    if (status === "request_sent") return <span className={`${base} bg-blue-50 text-blue-700`}>Solicitud enviada</span>;
    if (status === "request_received") return <span className={`${base} bg-amber-50 text-amber-700`}>Solicitud recibida</span>;
    return null;
  };

  const renderMemberActions = (user: MemberUser) => {
    const status = user.relationship_status || "none";
    const reqId = user.friend_request_id;
    if (status === "friends" && reqId) {
      return (
        <button
          onClick={() => handleRemoveFriend(reqId)}
          className="text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg"
        >
          Eliminar amigo
        </button>
      );
    }
    if (status === "request_sent" && reqId) {
      return (
        <button
          onClick={() => handleCancel(reqId)}
          className="text-sm text-gray-600 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-lg"
        >
          Cancelar
        </button>
      );
    }
    if (status === "request_received" && reqId) {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleAccept(reqId)}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
          >
            Aceptar
          </button>
          <button
            onClick={() => handleReject(reqId)}
            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
          >
            Rechazar
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => handleSend(user.id)}
        className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
      >
        Agregar amigo
      </button>
    );
  };

  const MemberCard = ({ user }: { user: MemberUser }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4 hover:shadow-lg transition">
        <div className="flex items-center gap-3">
          <img
            src={resolveMediaUrl(user.avatar) || "https://i.pravatar.cc/120?u=badgeup"}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {user.first_name || user.username} {user.last_name}
              </h3>
              {renderStatusChip(user.relationship_status || "none")}
            </div>
            <p className="text-sm text-gray-500">{user.points} puntos</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <div className="shrink-0">{renderMemberActions(user)}</div>
      </div>
    );
  };

  const RequestCard = ({
    request,
    incoming,
  }: {
    request: FriendRequest;
    incoming?: boolean;
  }) => {
    const other = incoming ? request.from_user : request.to_user;
    return (
      <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4 hover:shadow-lg transition">
        <div className="flex items-center gap-3">
          <img
            src={resolveMediaUrl(other.avatar) || "https://i.pravatar.cc/120?u=badgeup"}
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {other.first_name || other.username} {other.last_name}
            </h3>
            <p className="text-sm text-gray-500">{other.points} puntos</p>
            <p className="text-xs text-gray-400">{other.email}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {incoming ? (
            <>
              <button
                onClick={() => handleAccept(request.id)}
                className="text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700"
              >
                Aceptar
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
              >
                Rechazar
              </button>
            </>
          ) : (
            <button
              onClick={() => handleCancel(request.id)}
              className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  };

  const FriendCard = ({ user }: { user: MemberUser }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center justify-between gap-4 hover:shadow-lg transition">
      <div className="flex items-center gap-3">
        <img
          src={resolveMediaUrl(user.avatar) || "https://i.pravatar.cc/120?u=badgeup"}
          className="w-14 h-14 rounded-full object-cover border"
        />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {user.first_name || user.username} {user.last_name}
          </h3>
          <p className="text-sm text-gray-500">{user.points} puntos</p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
      {user.friend_request_id && (
        <button
          onClick={() => handleRemoveFriend(user.friend_request_id!)}
          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
        >
          Eliminar amigo
        </button>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500">Cargando...</p>;
    }
    if (tab === "community") {
      if (filteredMembers.length === 0) return <p className="text-gray-500">No hay usuarios registrados.</p>;
      return (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} user={member} />
          ))}
        </div>
      );
    }
    if (tab === "friends") {
      if (friends.length === 0) return <p className="text-gray-500">Aún no tienes amigos añadidos.</p>;
      return (
        <div className="space-y-3">
          {friends.map((friend) => (
            <FriendCard key={friend.id} user={friend} />
          ))}
        </div>
      );
    }
    if (tab === "received") {
      if (requestsReceived.length === 0) return <p className="text-gray-500">No tienes solicitudes pendientes.</p>;
      return (
        <div className="space-y-3">
          {requestsReceived.map((req) => (
            <RequestCard key={req.id} request={req} incoming />
          ))}
        </div>
      );
    }
    if (requestsSent.length === 0) return <p className="text-gray-500">No has enviado solicitudes.</p>;
    return (
      <div className="space-y-3">
        {requestsSent.map((req) => (
          <RequestCard key={req.id} request={req} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10 space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold text-gray-800">Conecta con la comunidad</h2>
          <p className="text-sm text-gray-500">
            Miembros totales: {members.length} · Amigos: {friends.length} · Solicitudes pendientes:{" "}
            {requestsReceived.length + requestsSent.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(tabLabels) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                tab === key ? "bg-blue-600 text-white" : "bg-white text-gray-700 border"
              }`}
            >
              {tabLabels[key]}
            </button>
          ))}
          {tab === "community" && (
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="ml-auto px-4 py-2 rounded-full border bg-white text-sm text-gray-700"
            />
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md min-h-[400px]">{renderContent()}</div>
      </main>
    </div>
  );
}
