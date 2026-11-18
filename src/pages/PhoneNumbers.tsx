import { useEffect, useState } from "react";
import { fetchAll } from "@/lib/fetchAll";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPhone, faUserCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import AdminShell, { EmptyState, Skeleton } from "@/components/admin/AdminShell";

const PhoneNumbersContent = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchNumbers = async () => {
      const { data, error } = await fetchAll<{ phone: string }>((a, b) => supabase.from("members").select("phone").order("phone", { ascending: true }).range(a, b));
      
      if (data) {
        setPhoneNumbers(data.map(m => m.phone));
      }
      setLoading(false);
    };
    fetchNumbers();
  }, []);

  const filteredNumbers = phoneNumbers.filter(num => 
    num.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isExactMatch = phoneNumbers.includes(searchTerm.trim());

  return (
    <AdminShell title="Phone numbers" subtitle={`${phoneNumbers.length.toLocaleString("en-NG")} registered numbers. Search to confirm whether someone has joined.`}>
      <div className="glass p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1">
            <label htmlFor="pn-search" className="sr-only">Search or confirm a phone number</label>
            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input id="pn-search" type="text" inputMode="tel" placeholder="Search or confirm a phone number"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full field rounded-full pl-11 pr-4 py-3 min-h-11 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-0" />
          </div>
          {searchTerm && (
            <div role="status" className={`px-5 py-3 rounded-full inline-flex items-center gap-2 whitespace-nowrap font-semibold text-sm ${isExactMatch ? "bg-lime/30 text-olive" : "bg-destructive/10 text-destructive"}`}>
              <FontAwesomeIcon icon={isExactMatch ? faUserCheck : faCircleExclamation} />
              {isExactMatch ? "Member confirmed" : "Not found"}
            </div>
          )}
        </div>
      </div>

      {loading ? <Skeleton rows={6} /> : filteredNumbers.length === 0 ? (
        <EmptyState title="No matching numbers" hint="Check the digits and try again." />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredNumbers.map((num, i) => (
            <li key={i} className="glass !rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-pale flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-olive" />
              </span>
              <a href={`tel:${num.replace(/\s/g, "")}`} className="text-sm font-medium text-foreground tabular-nums hover:underline">{num}</a>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
};

const PhoneNumbers = () => (
  <AccessGate>
    <PhoneNumbersContent />
  </AccessGate>
);

export default PhoneNumbers;
