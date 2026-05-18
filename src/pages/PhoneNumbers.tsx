import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSearch, faPhone, faUserCheck, faCircleExclamation } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";

const PhoneNumbersContent = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const fetchNumbers = async () => {
      const { data, error } = await supabase
        .from("members")
        .select("phone")
        .order("phone", { ascending: true });
      
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
    <div className="min-h-screen bg-background">
      <div className="section-container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Member Directory</h1>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
            {phoneNumbers.length} total
          </span>
        </div>

        {/* Search & Verification Box */}
        <div className="glass-card p-6 mb-8 bg-white/5 border-white/10">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search or confirm a phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-primary-foreground/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-base md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            {searchTerm && (
              <div className={`px-6 py-3.5 rounded-2xl flex items-center gap-2 whitespace-nowrap font-bold text-sm border ${
                isExactMatch 
                  ? "bg-primary/20 text-primary border-primary/30" 
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}>
                <FontAwesomeIcon icon={isExactMatch ? faUserCheck : faCircleExclamation} />
                {isExactMatch ? "Member Confirmed" : "Not Found"}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading directory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredNumbers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground italic text-sm">
                No matching numbers found in our database.
              </div>
            ) : (
              filteredNumbers.map((num, i) => (
                <div key={i} className="bg-card/50 border border-border rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FontAwesomeIcon icon={faPhone} className="w-3 h-3 text-primary/70" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{num}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PhoneNumbers = () => (
  <AccessGate customCode="GP$$$123">
    <PhoneNumbersContent />
  </AccessGate>
);

export default PhoneNumbers;
