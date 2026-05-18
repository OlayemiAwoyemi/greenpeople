import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUsers, faIdCard, faDownload, faClockRotateLeft, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
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

  const [selectedAge, setSelectedAge] = useState("");
  const [selectedLga, setSelectedLga] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedPvc, setSelectedPvc] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const uniqueStates = useMemo(() => {
    return Array.from(new Set(members.map(m => m.state).filter(Boolean))).sort();
  }, [members]);

  const uniqueLgas = useMemo(() => {
    const filtered = selectedState 
      ? members.filter(m => m.state === selectedState) 
      : members;
    return Array.from(new Set(filtered.map(m => m.lga).filter(Boolean))).sort();
  }, [members, selectedState]);

  const uniqueAgeGroups = useMemo(() => {
    return Array.from(new Set(members.map(m => m.age_group).filter(Boolean))).sort();
  }, [members]);

  const uniqueGenders = useMemo(() => {
    return Array.from(new Set(members.map(m => m.gender).filter(Boolean))).sort();
  }, [members]);

  const clearFilters = () => {
    setSelectedAge("");
    setSelectedLga("");
    setSelectedState("");
    setSelectedGender("");
    setSelectedPvc("");
    setSelectedCountry("");
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        m.full_name.toLowerCase().includes(s) ||
        m.phone.includes(s) ||
        m.state.toLowerCase().includes(s) ||
        m.lga.toLowerCase().includes(s);

      const matchesAge = !selectedAge || m.age_group === selectedAge;
      const matchesLga = !selectedLga || m.lga === selectedLga;
      const matchesState = !selectedState || m.state === selectedState;
      const matchesGender = !selectedGender || m.gender === selectedGender;
      const matchesPvc = !selectedPvc || m.has_pvc === selectedPvc;
      
      const matchesCountry = !selectedCountry || 
        (selectedCountry === "Nigeria" ? m.is_nigeria_based !== false : m.is_nigeria_based === false);

      return matchesSearch && matchesAge && matchesLga && matchesState && matchesGender && matchesPvc && matchesCountry;
    });
  }, [members, searchTerm, selectedAge, selectedLga, selectedState, selectedGender, selectedPvc, selectedCountry]);

  useEffect(() => {
    supabase.from("members").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setMembers(data); setLoading(false); });
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
            {filteredMembers.length === members.length ? `${members.length} total` : `${filteredMembers.length} filtered / ${members.length} total`}
          </span>
          <div className="w-full sm:w-auto sm:ml-auto flex flex-wrap items-center justify-start gap-2">
            <Link
              to="/#join"
              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
              Join Green People
            </Link>
            <button
              onClick={exportMembers}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors whitespace-nowrap border border-primary/20"
            >
              <FontAwesomeIcon icon={faDownload} className="w-3 h-3" />
              Export CSV
            </button>
            <button
              onClick={exportGoogleContacts}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              title="Download CSV formatted specifically for Google Contacts"
            >
              <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
              Google Contacts CSV
            </button>
            <button
              onClick={exportICloudContacts}
              className="inline-flex items-center gap-1.5 bg-[#007AFF] text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              title="Download CSV formatted specifically for iCloud/Apple Contacts"
            >
              <FontAwesomeIcon icon={faUsers} className="w-3 h-3" />
              iCloud Contacts CSV
            </button>
            <button
              onClick={exportSignupLog}
              className="inline-flex items-center gap-1.5 bg-secondary text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-secondary/80 transition-colors border border-border whitespace-nowrap"
              title="Download append-only backup log of every registration attempt"
            >
              <FontAwesomeIcon icon={faClockRotateLeft} className="w-3 h-3" />
              Full Backup Log
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative group">
          <FontAwesomeIcon 
            icon={faSearch} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" 
          />
          <input
            type="text"
            placeholder="Search by name, phone, state, or LGA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 bg-card border border-border rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5 text-primary" />
              Filter Members
            </h2>
            {(selectedAge || selectedLga || selectedState || selectedGender || selectedPvc || selectedCountry) && (
              <button 
                onClick={clearFilters}
                className="text-xs font-semibold text-destructive hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* State Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedLga(""); // Reset LGA on state change
                }}
                className="w-full text-xs bg-white/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">All States</option>
                {uniqueStates.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* LGA Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">LGA</label>
              <select
                value={selectedLga}
                disabled={!selectedState}
                onChange={(e) => setSelectedLga(e.target.value)}
                className="w-full text-xs bg-white/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground disabled:opacity-50"
              >
                <option value="">{selectedState ? "All LGAs" : "Select State First"}</option>
                {uniqueLgas.map((lg) => (
                  <option key={lg} value={lg}>{lg}</option>
                ))}
              </select>
            </div>

            {/* Age Group Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Age Group</label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full text-xs bg-white/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">All Age Groups</option>
                {uniqueAgeGroups.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full text-xs bg-white/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">All Genders</option>
                {uniqueGenders.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* PVC Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">PVC Status</label>
              <select
                value={selectedPvc}
                onChange={(e) => setSelectedPvc(e.target.value)}
                className="w-full text-xs bg-white/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">All PVC Statuses</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>

            {/* Country of Residence Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Residence</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full text-xs bg-white/50 border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              >
                <option value="">All Countries</option>
                <option value="Nigeria">Nigeria</option>
                <option value="Diaspora">Diaspora</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading...</div>
        ) : members.length === 0 ? (
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faUsers} className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No members yet</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-2xl p-8">
            <FontAwesomeIcon icon={faFilter} className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">No members match your selected filters</p>
            <button 
              onClick={clearFilters}
              className="text-xs text-primary font-semibold hover:underline mt-2"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((m) => (
              <div key={m.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-foreground truncate">{m.full_name}</span>
                    <span className="text-xs text-muted-foreground">· {m.gender}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {m.state}, {m.lga} · {m.age_group} · {m.phone} {m.is_nigeria_based === false && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded font-medium ml-1">Diaspora</span>}
                  </div>
                  {m.reason && (
                    <p className="text-xs text-muted-foreground/70 mt-1 italic line-clamp-2">"{m.reason}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <select
                      value={m.has_pvc}
                      disabled={updatingId === m.id}
                      onChange={(e) => updatePvc(m.id, e.target.value)}
                      style={{ backgroundImage: "none", paddingRight: "1.75rem" }}
                      className={`appearance-none cursor-pointer text-xs font-medium pl-7 pr-7 py-1.5 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
                        m.has_pvc === "Yes" ? "bg-primary/10 text-primary" : m.has_pvc === "In Progress" ? "bg-yellow-100 text-yellow-700" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {PVC_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="text-foreground bg-background">{opt}</option>
                      ))}
                    </select>
                    <FontAwesomeIcon icon={faIdCard} className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                    <svg className="w-2.5 h-2.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Members = () => (
  <AccessGate>
    <MembersContent />
  </AccessGate>
);

export default Members;
