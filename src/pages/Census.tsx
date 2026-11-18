import { useEffect, useMemo, useState } from "react";
import AccessGate from "@/components/AccessGate";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faChartColumn, faUsers } from "@fortawesome/free-solid-svg-icons";

type Member = {
  id: string;
  state: string | null;
  lga: string | null;
  age_group: string | null;
  gender: string | null;
  has_pvc: string | null;
  is_nigeria_based: boolean | null;
};

type Dim = "state" | "lga" | "country" | "age_group" | "gender" | "has_pvc";

const DIMS: { key: Dim; label: string }[] = [
  { key: "state", label: "State" },
  { key: "lga", label: "Local Government" },
  { key: "country", label: "Country of Residence" },
  { key: "age_group", label: "Age Group" },
  { key: "gender", label: "Gender" },
  { key: "has_pvc", label: "PVC Ownership" },
];

const COLORS = [
  "#255625",
  "#7cb43c",
  "#3d7a1f",
  "#a8d472",
  "#4f8a2a",
  "#1c3e1c",
  "#9bc55a",
  "#5d9b30",
  "#2e6b2e",
  "#c4e09a",
  "#6ba432",
  "#143a14",
];

const CensusContent = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dim, setDim] = useState<Dim>("state");

  useEffect(() => {
    (async () => {
      // Paginate to bypass 1000-row default
      const all: Member[] = [];
      const pageSize = 1000;
      let from = 0;
      while (true) {
        const { data, error } = await supabase
          .from("members")
          .select("id, state, lga, age_group, gender, has_pvc, is_nigeria_based")
          .range(from, from + pageSize - 1);
        if (error || !data || data.length === 0) break;
        all.push(...(data as Member[]));
        if (data.length < pageSize) break;
        from += pageSize;
      }
      setMembers(all);
      setLoading(false);
    })();
  }, []);

  const valueFor = (m: Member, d: Dim): string => {
    if (d === "country") return m.is_nigeria_based === false ? "Diaspora" : "Nigeria";
    const v = (m as any)[d];
    return v && String(v).trim() ? String(v).trim() : "Unspecified";
  };

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    members.forEach((m) => {
      const k = valueFor(m, dim);
      map.set(k, (map.get(k) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [members, dim]);

  const total = members.length;
  const topN = counts.slice(0, 20);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 section-container">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faUsers} className="text-primary text-2xl" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Green Census</h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Live breakdown of {total.toLocaleString()} registered Green People across Nigeria's 36 States + FCT and the diaspora.
        </p>

        {/* Dimension picker */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DIMS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDim(d.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                dim === d.key
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-muted text-foreground/70 hover:bg-muted/70"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading census…</div>
        ) : counts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No data yet.</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Pie */}
            <div className="glass p-5">
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faChartPie} className="text-primary" />
                <h2 className="font-semibold">Share by {DIMS.find((d) => d.key === dim)?.label}</h2>
              </div>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topN}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={120}
                      label={(e: any) => `${e.name} (${((e.value / total) * 100).toFixed(1)}%)`}
                    >
                      {topN.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v.toLocaleString()} members`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar */}
            <div className="glass p-5">
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faChartColumn} className="text-primary" />
                <h2 className="font-semibold">Counts by {DIMS.find((d) => d.key === dim)?.label}</h2>
              </div>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topN} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={70}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString()} members`} />
                    <Bar dataKey="value" fill="#7cb43c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Table */}
            <div className="glass p-5 lg:col-span-2">
              <h2 className="font-semibold mb-4">
                Full list — {counts.length} {DIMS.find((d) => d.key === dim)?.label.toLowerCase()} group{counts.length === 1 ? "" : "s"}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-pale text-muted-foreground">
                      <th className="py-2 pr-4">#</th>
                      <th className="py-2 pr-4">{DIMS.find((d) => d.key === dim)?.label}</th>
                      <th className="py-2 pr-4 text-right">Members</th>
                      <th className="py-2 pr-4 text-right">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counts.map((c, i) => (
                      <tr key={c.name} className="border-b border-pale/40">
                        <td className="py-2 pr-4 text-muted-foreground">{i + 1}</td>
                        <td className="py-2 pr-4 font-medium">{c.name}</td>
                        <td className="py-2 pr-4 text-right">{c.value.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right text-muted-foreground">
                          {((c.value / total) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Census = () => (
  <AccessGate>
    <CensusContent />
  </AccessGate>
);

export default Census;
