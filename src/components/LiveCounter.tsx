import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const formatNumber = (n: number) => n.toLocaleString("en-NG");

const LiveCounter = () => {
  const [members, setMembers] = useState(0);
  const [pvcHolders, setPvcHolders] = useState(0);

  const fetchCounts = async () => {
    const { count: totalMembers } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    const { count: totalPvc } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("has_pvc", "Yes");

    if (totalMembers !== null) setMembers(totalMembers);
    if (totalPvc !== null) setPvcHolders(totalPvc);
  };

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <span className="text-primary-foreground/60">Already</span>
      <span className="font-bold text-primary">
        {formatNumber(members)}
      </span>
      <span className="text-primary-foreground/60">joined</span>
      <span className="text-primary-foreground/30">·</span>
      <span className="font-bold text-primary">
        {formatNumber(pvcHolders)}
      </span>
      <span className="text-primary-foreground/60">with PVC</span>
    </motion.div>
  );
};

export default LiveCounter;
