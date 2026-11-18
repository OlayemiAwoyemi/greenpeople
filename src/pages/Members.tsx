import { useEffect, useMemo, useState } from "react";
import AdminShell, { Skeleton, EmptyState, ErrorState, Initials } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faDownload, faClockRotateLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import { useToast } from "@/hooks/use-toast";

const PVC_OPTIONS = ["Yes", "No", "In Progress"] as const;

const escapeCsv = (val: string | null | undefined) => {
  if (val == null) return "";
  const s = String(val);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (rows: Record<string, unknown>[], filename: string) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escapeCsv(r[h] as string)).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

type Member = {
  id: string;
  full_name: string;
  phone: string;
  state: string;
  lga: string;
  age_group: string;
  gender: string;
  has_pvc: string;
  is_nigeria_based: boolean | null;
  reason: string | null;
  created_at: string;
  first_name?: string;
  middle_name?: string;
  surname?: string;
};

const MembersContent = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [pvcFilter, setPvcFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [lgaFilter, setLgaFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sort, setSort] = useState<{ key: "full_name" | "state" | "created_at" | "has_pvc"; dir: 1 | -1 }>({ key: "created_at", dir: -1 });

  const load = () => {
    setLoading(true); setLoadError(false);
    supabase.from("members").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) setLoadError(true); else if (data) setMembers(data); setLoading(false); });
  };
  useEffect(load, []);

  const AGE_ORDER = ["18-24", "25-34", "35-44", "45-54", "55+"];

  const uniq = (key: "state" | "lga" | "age_group" | "gender") =>
    Array.from(new Set(members.map((m) => (m[key] ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const stateOptions = useMemo(() => uniq("state"), [members]);
  const ageOptions = useMemo(() => {
    const present = new Set(members.map((m) => (m.age_group ?? "").trim()).filter(Boolean));
    const ordered = AGE_ORDER.filter((a) => present.has(a));
    const extra = Array.from(present).filter((a) => !AGE_ORDER.includes(a)).sort();
    return [...ordered, ...extra];
  }, [members]);
  const genderOptions = useMemo(() => uniq("gender"), [members]);
  const lgaOptions = useMemo(
    () => (stateFilter === "all" ? uniq("lga") : uniq("lga").filter((l) => members.some((m) => m.lga === l && m.state === stateFilter))),
    [members, stateFilter]
  );

  const filtersOn =
    pvcFilter !== "all" || stateFilter !== "all" || lgaFilter !== "all" || ageFilter !== "all" || genderFilter !== "all" || countryFilter !== "all";

  const clearFilters = () => {
    setPvcFilter("all"); setStateFilter("all"); setLgaFilter("all");
    setAgeFilter("all"); setGenderFilter("all"); setCountryFilter("all");
  };

  const countryOf = (m: Member) => (m.is_nigeria_based === false ? "Diaspora" : "Nigeria");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((m) => pvcFilter === "all" || m.has_pvc === pvcFilter)
      .filter((m) => stateFilter === "all" || (m.state ?? "").trim() === stateFilter)
      .filter((m) => lgaFilter === "all" || (m.lga ?? "").trim() === lgaFilter)
      .filter((m) => ageFilter === "all" || (m.age_group ?? "").trim() === ageFilter)
      .filter((m) => genderFilter === "all" || (m.gender ?? "").trim() === genderFilter)
      .filter((m) => countryFilter === "all" || countryOf(m) === countryFilter)
      .filter((m) => !q || [m.full_name, m.phone, m.state, m.lga].some((v) => v?.toLowerCase().includes(q)))
      .sort((a, b) => String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? "")) * sort.dir);
  }, [members, query, pvcFilter, stateFilter, lgaFilter, ageFilter, genderFilter, countryFilter, sort]);

  const toggleSort = (key: typeof sort.key) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }));

  const updatePvc = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const previous = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, has_pvc: newStatus } : m)));
    const { error } = await supabase.from("members").update({ has_pvc: newStatus }).eq("id", id);
    setUpdatingId(null);
    if (error) {
      setMembers(previous);
      toast({ title: "Could not update PVC status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "PVC status updated" });
    }
  };

  const exportMembers = () => {
    if (members.length === 0) {
      toast({ title: "No members to export" });
      return;
    }
    downloadCsv(members as unknown as Record<string, unknown>[], `green-people-members-${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: `Exported ${members.length} members` });
  };

  const exportSignupLog = async () => {
    const { data, error } = await supabase
      .from("member_signup_log")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data || data.length === 0) {
      toast({ title: "No signup log entries to export", variant: error ? "destructive" : "default" });
      return;
    }
    downloadCsv(data as unknown as Record<string, unknown>[], `signup-log-backup-${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: `Exported ${data.length} log entries (full backup)` });
  };

  const exportGoogleContacts = () => {
    if (members.length === 0) {
      toast({ title: "No members to export" });
      return;
    }
    // Google CSV format: https://support.google.com/contacts/answer/1069522
    const contactRows = members.map(m => ({
      "Given Name": m.first_name || m.full_name.split(' ')[0] || "",
      "Additional Name": m.middle_name || "",
      "Family Name": m.surname || m.full_name.split(' ').slice(1).join(' ') || "",
      "Organization 1 - Name": "Green People",
      "Organization 1 - Type": "Work",
      "Phone 1 - Type": "Mobile",
      "Phone 1 - Value": m.phone
    }));
    downloadCsv(contactRows as unknown as Record<string, unknown>[], `google-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: `Exported ${members.length} contacts for Google` });
  };

  const exportICloudContacts = () => {
    if (members.length === 0) {
      toast({ title: "No members to export" });
      return;
    }
    // iCloud / Apple Contacts CSV format
    const contactRows = members.map(m => ({
      "First Name": m.first_name || m.full_name.split(' ')[0] || "",
      "Middle Name": m.middle_name || "",
      "Last Name": m.surname || m.full_name.split(' ').slice(1).join(' ') || "",
      "Organization": "Green People",
      "Phone": m.phone
    }));
    downloadCsv(contactRows as unknown as Record<string, unknown>[], `icloud-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
    toast({ title: `Exported ${members.length} contacts for iCloud` });
  };

  const SortBtn = ({ k, label }: { k: typeof sort.key; label: string }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 font-semibold hover:text-foreground" aria-label={`Sort by ${label}`}>
      {label}<span aria-hidden="true">{sort.key === k ? (sort.dir === 1 ? "↑" : "↓") : "↕"}</span>
    </button>
  );
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-NG", { dateStyle: "medium" });

  return (
    <AdminShell title="Members" subtitle={`${members.length} registered · ${visible.length} shown`}
      actions={<>
        <Link to="/#join" className="btn-glass !min-h-10 !px-4 !text-sm"><FontAwesomeIcon icon={faUsers} className="w-3 h-3" />Join Green People</Link>
        <button onClick={exportMembers} className="btn-primary !min-h-10 !px-4 !text-sm"><FontAwesomeIcon icon={faDownload} className="w-3 h-3" />Export CSV</button>
        <button onClick={exportGoogleContacts} className="btn-glass !min-h-10 !px-4 !text-sm" title="Download a CSV formatted for Google Contacts"><FontAwesomeIcon icon={faUsers} className="w-3 h-3" />Google Contacts</button>
        <button onClick={exportICloudContacts} className="btn-glass !min-h-10 !px-4 !text-sm" title="Download a CSV formatted for iCloud / Apple Contacts"><FontAwesomeIcon icon={faUsers} className="w-3 h-3" />iCloud Contacts</button>
        <button onClick={exportSignupLog} className="btn-glass !min-h-10 !px-4 !text-sm" title="Download append-only backup log of every registration attempt"><FontAwesomeIcon icon={faClockRotateLeft} className="w-3 h-3" />Full backup log</button>
      </>}>
      <div className="glass p-3 mb-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="m-search" className="sr-only">Search members</label>
          <input id="m-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, state or LGA"
            className="flex-1 bg-white/70 border border-pale rounded-2xl px-4 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60" />
          {filtersOn && (
            <button onClick={clearFilters} className="btn-glass !min-h-11 !px-4 !text-sm justify-center">
              <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />Clear filters
            </button>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1 px-1">State</span>
            <select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setLgaFilter("all"); }}
              className="w-full bg-white/70 border border-pale rounded-2xl px-3 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
              <option value="all">All states</option>
              {stateOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1 px-1">Local Government</span>
            <select value={lgaFilter} onChange={(e) => setLgaFilter(e.target.value)}
              className="w-full bg-white/70 border border-pale rounded-2xl px-3 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
              <option value="all">All LGAs</option>
              {lgaOptions.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1 px-1">Age Group</span>
            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}
              className="w-full bg-white/70 border border-pale rounded-2xl px-3 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
              <option value="all">All age groups</option>
              {ageOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1 px-1">Gender</span>
            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full bg-white/70 border border-pale rounded-2xl px-3 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
              <option value="all">All genders</option>
              {genderOptions.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1 px-1">PVC Ownership</span>
            <select value={pvcFilter} onChange={(e) => setPvcFilter(e.target.value)}
              className="w-full bg-white/70 border border-pale rounded-2xl px-3 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
              <option value="all">All PVC statuses</option>
              {PVC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-muted-foreground mb-1 px-1">Country of Residence</span>
            <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full bg-white/70 border border-pale rounded-2xl px-3 min-h-11 text-[15px] focus:outline-none focus:ring-[3px] focus:ring-primary/60">
              <option value="all">All locations</option>
              <option value="Nigeria">Nigeria</option>
              <option value="Diaspora">Diaspora</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? <Skeleton rows={6} /> : loadError ? <ErrorState onRetry={load} /> : members.length === 0 ? (
        <EmptyState title="No members yet" hint="New registrations will appear here." />
      ) : visible.length === 0 ? (
        <EmptyState title="No members match your search" hint="Try a different name, state or filter." />
      ) : (
        <>
          <div className="glass overflow-hidden hidden md:block">
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur text-left text-muted-foreground">
                  <tr>
                    <th className="p-3 pl-4"><SortBtn k="full_name" label="Name" /></th>
                    <th className="p-3"><SortBtn k="state" label="Location" /></th>
                    <th className="p-3">Details</th>
                    <th className="p-3"><SortBtn k="has_pvc" label="PVC" /></th>
                    <th className="p-3 pr-4"><SortBtn k="created_at" label="Joined" /></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((m) => (
                    <tr key={m.id} className="odd:bg-mist/60 align-top">
                      <td className="p-3 pl-4"><div className="flex items-center gap-3 min-w-0"><Initials name={m.full_name} />
                        <div className="min-w-0"><div className="font-semibold text-foreground">{m.full_name}</div>
                        {m.reason && <p className="text-xs text-muted-foreground italic line-clamp-1 max-w-xs">"{m.reason}"</p>}</div></div></td>
                      <td className="p-3 text-foreground">{m.state}<div className="text-xs text-muted-foreground">{m.lga}</div></td>
                      <td className="p-3 text-muted-foreground">{m.gender} · {m.age_group}<div className="text-xs">{m.phone}</div></td>
                      <td className="p-3"><div className="relative inline-block">
                      <select aria-label={`PVC status for ${m.full_name}`} value={m.has_pvc} disabled={updatingId === m.id}
                        onChange={(e) => updatePvc(m.id, e.target.value)} style={{ backgroundImage: "none" }}
                        className={`appearance-none cursor-pointer text-sm font-semibold pl-3 pr-8 py-1.5 min-h-9 rounded-full border-0 focus:outline-none focus:ring-[3px] focus:ring-primary/60 disabled:opacity-50 ${
                          m.has_pvc === "Yes" ? "bg-primary/25 text-foreground" : m.has_pvc === "In Progress" ? "bg-pale text-foreground" : "bg-destructive/10 text-destructive"}`}>
                        {PVC_OPTIONS.map((opt) => <option key={opt} value={opt} className="text-foreground bg-background">{opt}</option>)}
                      </select>
                      <svg className="w-2.5 h-2.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div></td>
                      <td className="p-3 pr-4 text-muted-foreground whitespace-nowrap">{fmt(m.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ul className="md:hidden space-y-3">
            {visible.map((m) => (
              <li key={m.id} className="glass p-4">
                <div className="flex items-start gap-3">
                  <Initials name={m.full_name} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-foreground">{m.full_name}</div>
                    <div className="text-sm text-muted-foreground">{m.state}, {m.lga}</div>
                    <div className="text-sm text-muted-foreground">{m.gender} · {m.age_group} · {m.phone}</div>
                    {m.reason && <p className="text-sm text-muted-foreground italic mt-1 line-clamp-2">"{m.reason}"</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3"><div className="relative inline-block">
                      <select aria-label={`PVC status for ${m.full_name}`} value={m.has_pvc} disabled={updatingId === m.id}
                        onChange={(e) => updatePvc(m.id, e.target.value)} style={{ backgroundImage: "none" }}
                        className={`appearance-none cursor-pointer text-sm font-semibold pl-3 pr-8 py-1.5 min-h-9 rounded-full border-0 focus:outline-none focus:ring-[3px] focus:ring-primary/60 disabled:opacity-50 ${
                          m.has_pvc === "Yes" ? "bg-primary/25 text-foreground" : m.has_pvc === "In Progress" ? "bg-pale text-foreground" : "bg-destructive/10 text-destructive"}`}>
                        {PVC_OPTIONS.map((opt) => <option key={opt} value={opt} className="text-foreground bg-background">{opt}</option>)}
                      </select>
                      <svg className="w-2.5 h-2.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </div><span className="text-xs text-muted-foreground">{fmt(m.created_at)}</span></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminShell>
  );
};

const Members = () => (
  <AccessGate>
    <MembersContent />
  </AccessGate>
);

export default Members;
