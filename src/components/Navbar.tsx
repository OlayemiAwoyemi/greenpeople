import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import greenLogo from "@/assets/green-logo.png";

const navLinks = [
  { label: "Why now", href: "#why-now" },
  { label: "Our mission", href: "#mission" },
  { label: "Values", href: "#values" },
  { label: "Updates", href: "/updates", isRoute: true },
  { label: "Ladder", href: "/ranks", isRoute: true },
  { label: "Finance", href: "/finance", isRoute: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const anchorHref = (h: string) => (isHomePage ? h : `/${h}`);
  const joinHref = isHomePage ? "#join" : "/#join";
  const linkCls = "text-sm font-semibold text-foreground/80 hover:text-foreground px-3 py-2 rounded-full hover:bg-white/60 transition-colors whitespace-nowrap";

  return (
    <motion.header initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 px-3 sm:px-5 pt-3">
      <nav aria-label="Main" className={`glass !rounded-full mx-auto max-w-6xl flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14 px-3 md:px-4" : "h-16 px-4 md:px-6"}`}>
        <Link to="/" className="flex items-center gap-2 min-h-11">
          <img src={greenLogo} alt="" width={32} height={32} className={`rounded-full transition-all ${scrolled ? "w-7 h-7" : "w-8 h-8"}`} />
          <span className="font-bold text-[15px] tracking-tight text-foreground whitespace-nowrap">Green People</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((l) => l.isRoute
            ? <Link key={l.href} to={l.href} className={linkCls}>{l.label}</Link>
            : <a key={l.href} href={anchorHref(l.href)} className={linkCls}>{l.label}</a>)}
        </div>

        <a href={joinHref} className="hidden lg:inline-flex btn-primary !min-h-10 !px-5 !text-sm">Join the movement</a>

        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}
          className="lg:hidden w-11 h-11 rounded-full flex items-center justify-center text-foreground hover:bg-white/60">
          <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-5 h-5" />
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="lg:hidden glass mx-auto max-w-6xl mt-2 p-3">
            <div className="flex flex-col">
              {navLinks.map((l) => l.isRoute
                ? <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)} className="text-foreground text-base font-semibold px-4 py-3 rounded-2xl hover:bg-white/70">{l.label}</Link>
                : <a key={l.href} href={anchorHref(l.href)} onClick={() => setMobileOpen(false)} className="text-foreground text-base font-semibold px-4 py-3 rounded-2xl hover:bg-white/70">{l.label}</a>)}
              <a href={joinHref} onClick={() => setMobileOpen(false)} className="btn-primary mt-2">Join the movement</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
