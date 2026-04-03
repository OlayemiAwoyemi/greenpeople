import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const formatNumber = (n: number) => n.toLocaleString("en-NG");

const LiveCounter = () => {
  const [members, setMembers] = useState(247832);
  const [voters, setVoters] = useState(184621);

  useEffect(() => {
    const interval = setInterval(() => {
      setMembers((prev) => prev + Math.floor(Math.random() * 3) + 1);
      setVoters((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.5 }}
      className="flex flex-wrap items-center gap-2 text-xs"
    >
      <span className="text-primary-foreground/60">Already</span>
      <span className="font-semibold text-primary animate-counter-pulse">
        {formatNumber(members)}
      </span>
      <span className="text-primary-foreground/60">joined</span>
      <span className="text-primary-foreground/30">·</span>
      <span className="font-semibold text-primary animate-counter-pulse">
        {formatNumber(voters)}
      </span>
      <span className="text-primary-foreground/60">voters registering</span>
    </motion.div>
  );
};

export default LiveCounter;
