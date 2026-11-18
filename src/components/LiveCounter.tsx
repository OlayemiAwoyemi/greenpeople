import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const formatNumber = (n: number) => n.toLocaleString("en-NG");

const LiveCounter = () => {
  const [members, setMembers] = useState(0);
  const [pvcHolders, setPvcHolders] = useState(0);
  const [pulse, setPulse] = useState(0);
  const prev = useRef({ m: 0, p: 0 });

  const fetchCounts = async () => {
    const { data } = await supabase.rpc("public_member_stats");
    const s = data?.[0];
    const totalMembers = s ? Number(s.members) : null;
    const totalPvc = s ? Number(s.pvc_holders) : null;

    if (totalMembers !== null) setMembers(totalMembers);
    if (totalPvc !== null) setPvcHolders(totalPvc);
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (prev.current.m !== members || prev.current.p !== pvcHolders) setPulse((x) => x + 1);
    prev.current = { m: members, p: pvcHolders };
  }, [members, pvcHolders]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="glass inline-grid grid-cols-2 divide-x divide-pale px-2 py-4"
      aria-live="polite"
    >
      {[{ n: members, l: "Members joined" }, { n: pvcHolders, l: "With PVC" }].map((s) => (
        <div key={s.l} className="px-6 text-center">
          <div key={pulse} className="animate-soft-pulse text-3xl md:text-4xl font-extrabold text-foreground tabular-nums tracking-tight">
            {formatNumber(s.n)}
          </div>
          <div className="text-sm font-semibold text-muted-foreground mt-0.5 whitespace-nowrap">{s.l}</div>
        </div>
      ))}
    </motion.div>
  );
};

export default LiveCounter;
