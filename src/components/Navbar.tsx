import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import greenLogo from "@/assets/green-logo.png";

const navLinks = [
  { label: "Why Now", href: "#why-now", anchor: true },
  { label: "Our Mission", href: "#mission", anchor: true },
  { label: "Values", href: "#values", anchor: true },
  { label: "Updates", href: "/updates", isRoute: true },
  { label: "Ladder", href: "/ranks", isRoute: true },
  { label: "Finance", href: "/finance", isRoute: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  // On non-home pages, always use "scrolled" (solid) style
  const solidNav = scrolled || !isHomePage;

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
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white/50 backdrop-blur-sm"
      }`}
    >
      <div className="section-container flex items-center justify-between h-14 md:h-16">
        <a href="/" className="flex items-center gap-2">
          <img src={greenLogo} alt="Green People" className="w-8 h-8 rounded-full" />
          <span className="font-bold text-lg tracking-tight text-foreground">
            Green People
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={isHomePage ? link.href : `/${link.href}`}
                onClick={(e) => {
                  if (!isHomePage) {
                    e.preventDefault();
                    window.location.href = `/${link.href}`;
                  }
                }}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            )
          )}
          <a
            href="#join"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Join Now
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/60 backdrop-blur-xl border-b border-white/20"
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
                    href={isHomePage ? link.href : `/${link.href}`}
                    onClick={(e) => {
                      setMobileOpen(false);
                      if (!isHomePage) {
                        e.preventDefault();
                        window.location.href = `/${link.href}`;
                      }
                    }}
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
