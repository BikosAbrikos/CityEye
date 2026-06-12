import { useEffect, useState } from "react";
import CityMap from "../components/CityMap.jsx";
import DistrictPanel from "../components/DistrictPanel.jsx";
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
      .then(([d, p, s]) => { setDistricts(d); setProblems(p); setStats(s); })
      .catch((e) => setError(e.message));
  }, []);

  const month = new Date()
    .toLocaleString("ru-RU", { month: "long" })
    .toUpperCase();

  return (
    <div className="relative h-full w-full">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <CityMap
          districts={districts}
          problems={problems}
          onSelectDistrict={setSelected}
        />
      </div>

      {/* Floating header */}
      <div className="absolute left-3 right-3 top-3 z-[500] pointer-events-none">
        <div className="rounded-2xl bg-white/92 backdrop-blur-sm px-4 py-2.5 shadow-soft pointer-events-auto">
          <div className="num text-[10px] font-semibold uppercase tracking-widest text-ink/40">
            Алматы · По районам
          </div>
          <div className="font-display text-base font-extrabold leading-tight">
            Индекс качества
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute left-1/2 top-20 z-[600] -translate-x-1/2 rounded-xl bg-poor px-4 py-2 text-sm text-white shadow-soft">
          {error}
        </div>
      )}

      {/* Bottom sheet — mobile: slides from bottom; desktop: sidebar */}
      <div
        className="
          absolute bottom-0 left-0 right-0 z-[500]
          flex flex-col
          bg-white sheet-shadow rounded-t-3xl
          max-h-[52vh]
          md:top-0 md:right-0 md:left-auto md:bottom-0
          md:w-[340px] md:rounded-none md:max-h-none
          md:border-l md:border-ink/10 md:shadow-none
        "
      >
        {/* Drag handle */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-ink/15" />
        </div>

        <div className="overflow-y-auto flex-1 px-4 pb-4 pt-2 md:pt-5">
          <DistrictPanel
            districts={districts}
            stats={stats}
            month={month}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        </div>
      </div>
    </div>
  );
}
