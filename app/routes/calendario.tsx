import type { Route } from "./+types/calendario";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { StickersHistoryAPI, type StickerHistoryItem } from "../services/api";
import { useToast } from "../ui/ToastProvider";

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Calendario de capturas | BadgeUp" },
    { name: "description", content: "Historial de stickers desbloqueados" },
  ];
}

type CalendarDay = {
  date: Date | null;
  items: StickerHistoryItem[];
};

export default function Calendario() {
  const [history, setHistory] = useState<StickerHistoryItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const { error } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const data = await StickersHistoryAPI.list();
        setHistory(data);
      } catch {
        error("No pudimos cargar el historial.");
      }
    })();
  }, [error]);

  const matrix = useMemo<CalendarDay[]>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: CalendarDay[] = [];

    const grouped: Record<string, StickerHistoryItem[]> = {};
    history.forEach((h) => {
      if (!h.unlocked_at) return;
      const d = new Date(h.unlocked_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(h);
    });

    for (let i = 0; i < startWeekday; i++) {
      cells.push({ date: null, items: [] });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      cells.push({
        date: d,
        items: grouped[key] || [],
      });
    }
    return cells;
  }, [currentMonth, history]);

  const monthLabel = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  const gotoMonth = (delta: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendario de capturas</h1>
            <p className="text-sm text-gray-600">Explora tus stickers desbloqueados por día.</p>
          </div>
        </header>

        <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <button
            onClick={() => gotoMonth(-1)}
            className="px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            ←
          </button>
          <span className="text-lg font-semibold text-gray-800">{monthLabel}</span>
          <button
            onClick={() => gotoMonth(1)}
            className="px-3 py-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            →
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <div className="grid grid-cols-7 gap-2 text-center text-gray-500 font-semibold text-sm mb-3">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {matrix.map((cell, idx) => {
              if (!cell.date) {
                return <div key={idx} className="h-24 bg-gray-50 rounded-xl" />;
              }
              const isToday = new Date().toDateString() === cell.date.toDateString();
              return (
                <div
                  key={idx}
                  className={`h-24 rounded-xl border ${isToday ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-gray-50"} p-2 flex flex-col gap-1 overflow-hidden`}
                  role="button"
                  tabIndex={0}
                  onClick={() => cell.items.length > 0 && setSelected(cell)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && cell.items.length > 0) setSelected(cell);
                  }}
                >
                  <div className="text-xs font-semibold text-gray-700">{cell.date.getDate()}</div>
                  <div className="space-y-1 overflow-y-auto">
                    {cell.items.slice(0, 3).map((item) => (
                      <Link
                        to={`/app/stickers/${item.sticker_id}`}
                        key={item.id}
                        className="block text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1 text-gray-700 hover:bg-blue-50 hover:border-blue-200"
                      >
                        {item.sticker_name}
                        <span className="block text-[10px] text-gray-500">{item.album_title}</span>
                      </Link>
                    ))}
                    {cell.items.length > 3 && (
                      <span className="text-[10px] text-blue-600 block font-semibold">
                        +{cell.items.length - 3} más · ver
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">
                    {selected.date ? selected.date.toLocaleDateString() : ""}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">Capturas de este día</h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-500 hover:text-gray-800 text-lg"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
              {selected.items.length === 0 ? (
                <p className="text-sm text-gray-500">Sin capturas.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selected.items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/app/stickers/${item.sticker_id}`}
                      className="block border border-gray-200 rounded-lg px-3 py-2 hover:bg-blue-50"
                    >
                      <p className="text-sm font-semibold text-gray-800">{item.sticker_name}</p>
                      <p className="text-xs text-gray-500">{item.album_title}</p>
                      <p className="text-[10px] text-gray-400">
                        {item.unlocked_at ? new Date(item.unlocked_at).toLocaleString() : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
