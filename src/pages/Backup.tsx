import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AccessGate from "@/components/AccessGate";
import AdminShell from "@/components/admin/AdminShell";
import { fetchAll } from "@/lib/fetchAll";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faDatabase, faShield } from "@fortawesome/free-solid-svg-icons";

const TABLES = [
  "members", "member_signup_log",
  "social_posts", "social_clicks",
  "curriculum_items", "curriculum_reads",
  "lesson_quizzes", "quiz_attempts",
  "finance_entries",
  "page_visits", "member_referrals",
  "blog_posts", "chat_conversations", "chat_messages",
] as const;

const BackupContent = () => {
  const { toast } = useToast();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const out: Record<string, number> = {};
      for (const t of TABLES) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count } = await (supabase as any).from(t).select("*", { count: "exact", head: true });
        out[t] = count ?? 0;
      }
      setCounts(out);
    })();
  }, []);

  const downloadAll = async () => {
    setBusy(true);
    try {
      const dump: Record<string, unknown[]> = {};
      for (const t of TABLES) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await fetchAll((a, b) => (supabase as any).from(t).select("*").range(a, b));
        if (error) console.warn(t, error);
        dump[t] = data ?? [];
      }
      const meta = { exported_at: new Date().toISOString(), source: "greenpeople.ng", version: 1 };
      const blob = new Blob([JSON.stringify({ meta, data: dump }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `green-people-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast({ title: "Backup downloaded" });
    } catch (e) {
      toast({ title: "Backup failed", description: e instanceof Error ? e.message : "Unknown", variant: "destructive" });
    } finally { setBusy(false); }
  };

  const downloadTable = async (t: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await fetchAll((a, b) => (supabase as any).from(t).select("*").range(a, b));
    if (error || !data) return toast({ title: `Failed: ${t}`, variant: "destructive" });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${t}-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const total = Object.values(counts).reduce((x, y) => x + y, 0);
  const loaded = Object.keys(counts).length === TABLES.length;

  return (
    <AdminShell title="Backup vault" subtitle="Download a complete copy of every table. Save one every week."
      actions={
        <button onClick={downloadAll} disabled={busy} className="btn-primary !min-h-11 disabled:opacity-60">
          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" /> {busy ? "Bundling…" : "Download full backup"}
        </button>
      }>
      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        <div className="glass p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Records</div>
          <div className="mt-1 text-3xl font-black text-foreground tabular-nums">{loaded ? total.toLocaleString("en-NG") : "…"}</div>
        </div>
        <div className="glass p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tables</div>
          <div className="mt-1 text-3xl font-black text-foreground tabular-nums">{TABLES.length}</div>
        </div>
        <div className="glass p-5 flex gap-3 items-start">
          <FontAwesomeIcon icon={faShield} className="w-4 h-4 mt-1 text-olive" />
          <p className="text-sm text-muted-foreground">The file is JSON and holds members' phone numbers. Keep it somewhere private.</p>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="px-4 py-3 border-b border-pale font-semibold text-sm flex items-center gap-2">
          <FontAwesomeIcon icon={faDatabase} className="w-3.5 h-3.5" /> Tables
        </div>
        <ul className="divide-y divide-pale">
          {TABLES.map((t) => (
            <li key={t} className="px-4 py-2.5 flex items-center gap-3 min-w-0">
              <span className="flex-1 min-w-0 truncate text-sm font-medium text-foreground">{t.replace(/_/g, " ")}</span>
              <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">{counts[t] === undefined ? "…" : counts[t].toLocaleString("en-NG")}</span>
              <button onClick={() => downloadTable(t)} className="btn-glass !min-h-9 !px-3 !text-xs" aria-label={`Download ${t}`}>
                <FontAwesomeIcon icon={faDownload} className="w-3 h-3" /> JSON
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AdminShell>
  );
};

const Backup = () => <AccessGate><BackupContent /></AccessGate>;
export default Backup;
