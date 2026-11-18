import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Resets every scrollable part of a popup to its top. */
export const scrollBoxToTop = (root: Element | null) => {
  if (!root) return;
  (root as HTMLElement).scrollTop = 0;
  root.querySelectorAll<HTMLElement>("*").forEach((el) => { if (el.scrollTop > 0) el.scrollTop = 0; });
};

/**
 * Every page opens at the top (links to a #section still jump to that
 * section), and every popup or modal opens scrolled to its top.
 */
const ScrollToTop = () => {
  const { pathname, search, hash, key } = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const jump = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: "start" });
        else if (tries++ < 20) setTimeout(jump, 100); // lazy pages may still be loading
      };
      jump();
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, hash, key]);

  // Popups: whenever a dialog appears, start it at the top.
  useEffect(() => {
    const seen = new WeakSet<Element>();
    const check = () => {
      document.querySelectorAll('[role="dialog"], [role="alertdialog"]').forEach((d) => {
        if (seen.has(d)) return;
        seen.add(d);
        requestAnimationFrame(() => scrollBoxToTop(d));
      });
    };
    const obs = new MutationObserver(check);
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  return null;
};

export default ScrollToTop;
