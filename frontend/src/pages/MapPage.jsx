import { useEffect, useState } from "react";
import CityMap from "../components/CityMap.jsx";
import DistrictPanel from "../components/DistrictPanel.jsx";
import StatsBar from "../components/StatsBar.jsx";
import { api } from "../lib/api.js";

export default function MapPage() {
  const [districts, setDistricts] = useState([]);
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.districts(),
      api.problems({ status: "open" }),
      api.stats(),
    ])
      .then(([d, p, s]) => {
        setDistricts(d);
        setProblems(p);
        setStats(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1">
        <CityMap
          districts={districts}
          problems={problems}
          onSelectDistrict={setSelected}
        />
        {error && (
          <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-xl2 bg-poor px-4 py-2 text-sm text-white shadow-soft">
            Не удалось загрузить данные: {error}
          </div>
        )}
      </div>

      <aside className="w-[340px] shrink-0 space-y-4 overflow-y-auto border-l border-ink/10 bg-canvas p-4">
        <StatsBar stats={stats} />
        <DistrictPanel
          districts={districts}
          selectedId={selected?.id}
          onSelect={setSelected}
        />
      </aside>
    </div>
  );
}
