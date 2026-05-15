import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import greenLogo from "@/assets/green-logo.png";

const navLinks = [
  { label: "Mission", href: "#mission", anchor: true },
  { label: "Values", href: "#values", anchor: true },
  { label: "Updates", href: "/updates", isRoute: true },
  { label: "Ladder", href: "/ranks", isRoute: true },
  { label: "Finance", href: "/finance", isRoute: true },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60"
    >
      <div className="section-container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2.5">
          <img src={greenLogo} alt="Green People" className="w-7 h-7 rounded-full" />
          <span className="font-semibold text-[15px] tracking-tight text-foreground">
            Green People
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.href}
                to={link.href}
                className="text-[14px] text-foreground/70 hover:text-foreground px-3 py-2 rounded-md transition-colors"
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
                className="text-[14px] text-foreground/70 hover:text-foreground px-3 py-2 rounded-md transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <a
            href="#join"
            className="text-[14px] text-foreground/70 hover:text-foreground px-3 py-2 transition-colors"
          >
            Sign in
          </a>
          <a href="#join" className="gp-pill-primary text-[14px] px-5 py-2">
            Get started
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
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
            className="md:hidden bg-background border-b border-border"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground/80 text-sm py-2.5"
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
                    className="text-foreground/80 text-sm py-2.5"
                  >
                    {link.label}
                  </a>
                )
              )}
              <a
                href="#join"
                onClick={() => setMobileOpen(false)}
                className="gp-pill-primary mt-2"
              >
                Get started
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
