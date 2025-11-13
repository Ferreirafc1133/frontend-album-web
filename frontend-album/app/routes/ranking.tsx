import type { Route } from "./+types/ranking";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ranking | BadgeUp" },
    { name: "description", content: "Ranking global" },
  ];
}

function Medal({ place }: { place: number }) {
  const colors: Record<number, string> = {
    1: "text-yellow-500 border-yellow-400",
    2: "text-gray-600 border-gray-400",
    3: "text-orange-500 border-orange-400",
  };
  const color = colors[place] || "text-blue-600";
  return (
    <span className={`text-3xl font-bold mr-4 ${color}`}>{place}</span>
  );
}

export default function Ranking() {
  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <main className="flex-1 p-10">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Ranking Global</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
            <Medal place={1} />
            <img src="https://i.pravatar.cc/80?img=1" alt="María" className="w-16 h-16 rounded-full border-2 border-yellow-400" />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">María López</h3>
              <p className="text-sm text-gray-500">5 álbumes completados · 180 logros</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "95%" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
            <Medal place={2} />
            <img src="https://i.pravatar.cc/80?img=3" alt="Carlos" className="w-16 h-16 rounded-full border-2 border-gray-400" />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">Carlos Pérez</h3>
              <p className="text-sm text-gray-500">4 álbumes completados · 150 logros</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-gray-500 h-2 rounded-full" style={{ width: "85%" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
            <Medal place={3} />
            <img src="https://i.pravatar.cc/80?img=4" alt="Laura" className="w-16 h-16 rounded-full border-2 border-orange-400" />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">Laura Gómez</h3>
              <p className="text-sm text-gray-500">4 álbumes completados · 140 logros</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
            <span className="text-xl font-bold text-blue-600 mr-4">4</span>
            <img src="https://i.pravatar.cc/80?img=5" className="w-14 h-14 rounded-full border" />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">Fernando Chávez</h3>
              <p className="text-sm text-gray-500">3 álbumes completados · 120 logros</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "70%" }} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition">
            <span className="text-xl font-bold text-blue-600 mr-4">5</span>
            <img src="https://i.pravatar.cc/80?img=8" className="w-14 h-14 rounded-full border" />
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-800">Ana Torres</h3>
              <p className="text-sm text-gray-500">3 álbumes completados · 110 logros</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-600">
                <th className="py-3 px-5">#</th>
                <th className="py-3 px-5">Usuario</th>
                <th className="py-3 px-5">Álbumes</th>
                <th className="py-3 px-5">Logros</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-3 px-5">6</td>
                <td className="py-3 px-5">Luis Martínez</td>
                <td className="py-3 px-5">3</td>
                <td className="py-3 px-5">100</td>
              </tr>
              <tr className="border-t">
                <td className="py-3 px-5">7</td>
                <td className="py-3 px-5">Sofía Ruiz</td>
                <td className="py-3 px-5">2</td>
                <td className="py-3 px-5">95</td>
              </tr>
              <tr className="border-t">
                <td className="py-3 px-5">8</td>
                <td className="py-3 px-5">Jorge Díaz</td>
                <td className="py-3 px-5">2</td>
                <td className="py-3 px-5">90</td>
              </tr>
              <tr>
                <td colSpan={4} className="py-3 px-5 text-center text-gray-400">
                  ... y más usuarios
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
