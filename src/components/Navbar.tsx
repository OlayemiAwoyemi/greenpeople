import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import greenLogo from "@/assets/green-logo.png";

const navLinks = [
  { label: "Why Now", href: "#why-now" },
  { label: "Our Mission", href: "#mission" },
  { label: "Register", href: "#register" },
  { label: "Values", href: "#values" },
  { label: "Momentum", href: "#momentum" },
  { label: "Updates", href: "/updates", isRoute: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="section-container flex items-center justify-between h-14 md:h-16">
        <a href="/" className="flex items-center gap-2">
          <img src={greenLogo} alt="Green People" className="w-8 h-8 rounded-full" />
          <span className={`font-semibold text-sm tracking-tight transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
            Green People
          </span>
        </a>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className={`text-xs font-medium uppercase tracking-wide transition-colors hover:opacity-70 ${
                  scrolled ? "text-foreground/70" : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className={`text-xs font-medium uppercase tracking-wide transition-colors hover:opacity-70 ${
                  scrolled ? "text-foreground/70" : "text-primary-foreground/80"
                }`}
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="#join"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity uppercase tracking-wide"
          >
            Join Now
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden ${scrolled ? "text-foreground" : "text-primary-foreground"}`}
        >
          <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="section-container py-4 flex flex-col gap-3">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground/70 text-sm font-medium py-1"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground/70 text-sm font-medium py-1"
                  >
                    {link.label}
                  </a>
                )
              )}
              <a
                href="#join"
                onClick={() => setMobileOpen(false)}
                className="bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-center text-sm font-semibold mt-1"
              >
                Join the Movement
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
