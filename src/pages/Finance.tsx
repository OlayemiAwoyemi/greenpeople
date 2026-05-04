import { useEffect, useState } from "react";
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

  useEffect(() => {
    supabase
      .from("finance_entries")
      .select("*")
      .order("occurred_on", { ascending: false })
      .then(({ data }) => {
        setEntries((data ?? []) as Entry[]);
        setLoading(false);
      });
  }, []);

  const income = entries.filter((e) => e.kind === "income").reduce((s, e) => s + Number(e.amount_naira), 0);
  const expenditure = entries.filter((e) => e.kind === "expenditure").reduce((s, e) => s + Number(e.amount_naira), 0);
  const balance = income - expenditure;

  const fmt = (n: number) => `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-5">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-3 border border-white/20">
            <FontAwesomeIcon icon={faMoneyBillTrendUp} className="w-3 h-3" />
            Open books — public transparency
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Our Finances</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Every naira in. Every naira out. Updated live, open to all Nigerians, forever.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="glass-card bg-emerald-500/10 border-emerald-500/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faArrowTrendUp} className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Income</span>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{fmt(income)}</div>
          </div>
          <div className="glass-card bg-red-500/10 border-red-500/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faArrowTrendDown} className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Expenditure</span>
            </div>
            <div className="text-2xl font-bold text-red-700">{fmt(expenditure)}</div>
          </div>
          <div className="glass-card bg-white/20 border-white/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faScaleBalanced} className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Balance</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{fmt(balance)}</div>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 font-semibold text-sm">All Entries ({entries.length})</div>
          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-sm">Loading…</div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No entries yet.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {entries.map((e) => (
                <div key={e.id} className="p-4 flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded whitespace-nowrap border ${e.kind === "income" ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/20" : "bg-red-500/20 text-red-600 border-red-500/20"}`}>
                    {e.kind}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground">{e.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(e.occurred_on).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      {e.source_or_payee ? ` · ${e.source_or_payee}` : ""}
                    </div>
                  </div>
                  <div className={`font-bold text-sm whitespace-nowrap ${e.kind === "income" ? "text-emerald-600" : "text-red-600"}`}>
                    {e.kind === "income" ? "+" : "−"}{fmt(Number(e.amount_naira))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Records are managed by the movement's HQ. Public for all Nigerians, always.
        </p>
      </div>
    </div>
  );
};

export default Finance;
