import { useEffect, useMemo, useState } from "react";
import { Skeleton, EmptyState, ErrorState } from "@/components/admin/AdminShell";
import { CountUp } from "@/components/sky/Reveal";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp, faArrowTrendDown, faScaleBalanced, faMoneyBillTrendUp } from "@fortawesome/free-solid-svg-icons";

type Entry = {
  id: string;
  kind: string;
  description: string;
  amount_naira: number;
  source_or_payee: string | null;
  occurred_on: string;
};

const Finance = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState<{ key: "occurred_on" | "amount_naira" | "description"; dir: 1 | -1 }>({ key: "occurred_on", dir: -1 });

  const load = () => {
    setLoading(true); setFailed(false);
    supabase
      .from("finance_entries")
      .select("*")
      .order("occurred_on", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        setEntries((data ?? []) as Entry[]);
        setLoading(false);
      });
  };
  useEffect(load, []);

  // Running balance computed chronologically (oldest first) over all entries
  const running = useMemo(() => {
    const map = new Map<string, number>(); let bal = 0;
    [...entries].sort((a, b) => a.occurred_on.localeCompare(b.occurred_on)).forEach((e) => {
      bal += (e.kind === "income" ? 1 : -1) * Number(e.amount_naira); map.set(e.id, bal);
    });
    return map;
  }, [entries]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter((e) => kind === "all" || e.kind === kind)
      .filter((e) => !q || e.description.toLowerCase().includes(q) || (e.source_or_payee ?? "").toLowerCase().includes(q))
      .sort((a, b) => {
        const av = sort.key === "amount_naira" ? Number(a.amount_naira) : String(a[sort.key]);
        const bv = sort.key === "amount_naira" ? Number(b.amount_naira) : String(b[sort.key]);
        return (av < bv ? -1 : av > bv ? 1 : 0) * sort.dir;
      });
  }, [entries, query, kind, sort]);
  const toggle = (key: typeof sort.key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : -1 }));
  const arrow = (key: typeof sort.key) => (sort.key === key ? (sort.dir === 1 ? "↑" : "↓") : "↕");

  const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + Number(e.amount_naira), 0);
  const expenditure = entries.filter((e) => e.kind === "expenditure").reduce((s, e) => s + Number(e.amount_naira), 0);
  const balance = income - expenditure;

  const fmt = (n: number) => `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 glass !rounded-full text-foreground text-sm font-semibold px-4 py-1.5 mb-3">
            <FontAwesomeIcon icon={faMoneyBillTrendUp} className="w-3 h-3" />
            Open books — public transparency
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Our finances</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Every naira in. Every naira out. Updated live, open to all Nigerians, forever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { l: "Income", v: income, icon: faArrowTrendUp, c: "text-olive" },
            { l: "Expenditure", v: expenditure, icon: faArrowTrendDown, c: "text-destructive" },
            { l: "Balance", v: balance, icon: faScaleBalanced, c: "text-foreground" },
          ].map((t) => (
            <div key={t.l} className="glass p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="icon-chip w-8 h-8"><FontAwesomeIcon icon={t.icon} className="w-3.5 h-3.5" /></span>
                <span className="text-sm font-semibold text-muted-foreground">{t.l}</span>
              </div>
              <div className={`text-2xl font-extrabold tabular-nums ${t.c}`}>
                {t.v < 0 ? "−" : ""}₦<CountUp value={Math.round(Math.abs(t.v))} />
              </div>
            </div>
          ))}
        </div>

        <div className="glass p-3 mb-4 flex flex-col sm:flex-row gap-2">
          <label htmlFor="f-search" className="sr-only">Search entries</label>
          <input id="f-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search description or payee"
            className="flex-1 field rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-0" />
          <label htmlFor="f-kind" className="sr-only">Filter by type</label>
          <select id="f-kind" value={kind} onChange={(e) => setKind(e.target.value)}
            className="field rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-0">
            <option value="all">All entries</option><option value="income">Income only</option><option value="expenditure">Expenditure only</option>
          </select>
        </div>

        {loading ? <Skeleton rows={6} /> : failed ? <ErrorState onRetry={load} /> : entries.length === 0 ? (
          <EmptyState title="No entries yet" hint="Income and spending will appear here as soon as HQ records them." />
        ) : visible.length === 0 ? <EmptyState title="No entries match your search" /> : (
          <div className="glass overflow-hidden">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur text-left text-muted-foreground">
                  <tr>
                    <th className="p-3 pl-4"><button className="font-semibold" onClick={() => toggle("occurred_on")} aria-label="Sort by date">Date {arrow("occurred_on")}</button></th>
                    <th className="p-3"><button className="font-semibold" onClick={() => toggle("description")} aria-label="Sort by description">Description {arrow("description")}</button></th>
                    <th className="p-3 text-right"><button className="font-semibold" onClick={() => toggle("amount_naira")} aria-label="Sort by amount">Amount {arrow("amount_naira")}</button></th>
                    <th className="p-3 pr-4 text-right hidden sm:table-cell">Running total</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((e) => (
                    <tr key={e.id} className="odd:bg-mist/60 align-top">
                      <td className="p-3 pl-4 whitespace-nowrap text-muted-foreground">{new Date(e.occurred_on).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                      <td className="p-3 text-foreground">{e.description}{e.source_or_payee && <div className="text-xs text-muted-foreground">{e.source_or_payee}</div>}</td>
                      <td className={`p-3 text-right font-bold whitespace-nowrap tabular-nums ${e.kind === "income" ? "text-olive" : "text-destructive"}`}>
                        {e.kind === "income" ? "+" : "−"}{fmt(Number(e.amount_naira))}
                      </td>
                      <td className="p-3 pr-4 text-right whitespace-nowrap tabular-nums text-foreground hidden sm:table-cell">{fmt(running.get(e.id) ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Records are managed by the movement's HQ. Public for all Nigerians, always.
        </p>
      </div>
    </div>
  );
};

export default Finance;
