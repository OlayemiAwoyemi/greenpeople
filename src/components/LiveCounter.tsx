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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base"
    >
      <span className="text-primary-foreground/70">Already</span>
      <span className="font-bold text-accent animate-counter-pulse">
        {formatNumber(members)}
      </span>
      <span className="text-primary-foreground/70">Nigerians joined</span>
      <span className="text-primary-foreground/40">•</span>
      <span className="font-bold text-accent animate-counter-pulse">
        {formatNumber(voters)}
      </span>
      <span className="text-primary-foreground/70">new voters registering right now</span>
    </motion.div>
  );
};

export default LiveCounter;
