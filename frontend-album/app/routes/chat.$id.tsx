import type { Route } from "./+types/chat.$id";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { ChatAPI, buildWsBase, type ChatMessage, resolveMediaUrl } from "../services/api";
import { useUserStore } from "../store/useUserStore";
import { useToast } from "../ui/ToastProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Chat | BadgeUp" },
    { name: "description", content: "Conversación con tu amigo en tiempo real" },
  ];
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { error, success } = useToast();
  const token = useUserStore((s) => s.token);
  const user = useUserStore((s) => s.user);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const wsUrl = useMemo(() => {
    if (!id || !token) return null;
    const base =
      (import.meta.env.VITE_WS_URL as string | undefined) ||
      buildWsBase((import.meta.env.VITE_API_URL as string) || "http://localhost:8000/api");
    return `${base}/ws/chat/${id}/?token=${token}`;
  }, [id, token]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const loadMessages = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await ChatAPI.list(id, 100);
      setMessages(data);
      scrollToBottom();
    } catch {
      error("No pudimos cargar el chat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!wsUrl) return;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat_message" && data.message) {
          setMessages((prev) => [...prev, data.message as ChatMessage]);
          scrollToBottom();
        }
      } catch (err) {
        console.error(err);
      }
    };
    ws.onerror = () => {
      error("Socket desconectado.");
    };
    return () => {
      ws.close();
    };
  }, [wsUrl, error]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!text.trim() && !file) return;
    try {
      await ChatAPI.send(id, { text: text.trim(), file });
      setText("");
      setFile(null);
      success("Enviado");
    } catch {
      error("No se pudo enviar el mensaje.");
    }
  };

  if (!token) {
    return (
      <div className="p-10 text-gray-600">
        Necesitas iniciar sesión para ver el chat.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto flex-1 w-full p-6">
        <div className="bg-white rounded-2xl shadow-md flex flex-col h-[80vh] overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
            <p className="text-xs text-gray-500">Mensajes en tiempo real entre amigos.</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {loading ? (
              <p className="text-gray-500">Cargando mensajes...</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500">No hay mensajes todavía. ¡Envía el primero!</p>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 shadow text-sm ${
                        isMine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                      {msg.file_url && (
                        <a
                          href={resolveMediaUrl(msg.file_url) || msg.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className={`underline text-xs block mt-1 ${isMine ? "text-blue-100" : "text-blue-700"}`}
                        >
                          Archivo adjunto
                        </a>
                      )}
                      <span className={`text-[10px] mt-1 block ${isMine ? "text-blue-100" : "text-gray-500"}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          <form className="border-t px-4 py-3 flex items-center gap-3" onSubmit={handleSend}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-2 rounded-full border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700 cursor-pointer px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
              Adjuntar
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={!text.trim() && !file}
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
