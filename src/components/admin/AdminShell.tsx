import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import greenLogo from "@/assets/green-logo.png";

const tabs = [
  { to: "/hq", label: "HQ" }, { to: "/members", label: "Members" }, { to: "/ranks", label: "Ranks" },
  { to: "/finance", label: "Finance" }, { to: "/census", label: "Census" }, { to: "/chats", label: "Chats" },
  { to: "/write", label: "Write" }, { to: "/phonenumbers", label: "Phones" }, { to: "/backup", label: "Backup" },
];

/** Consistent admin layout: glass top bar, breadcrumb to HQ, segmented nav. */
const AdminShell = ({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) => (
  <div className="min-h-screen pb-16 overflow-x-hidden">
    <header className="sticky top-0 z-40 px-3 sm:px-5 pt-3">
      <div className="glass !rounded-3xl max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 min-h-11 shrink-0" aria-label="Green People home">
            <img src={greenLogo} alt="" width={28} height={28} className="w-7 h-7 rounded-full" />
            <span className="font-bold text-sm hidden sm:inline">Green People</span>
          </Link>
          <nav aria-label="Admin sections" className="min-w-0 overflow-x-auto">
            <ul className="flex gap-1 bg-mist/80 rounded-full p-1 w-max">
              {tabs.map((t) => (
                <li key={t.to}>
                  <NavLink to={t.to} className={({ isActive }) =>
                    `block px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${isActive ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {t.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <main className="max-w-6xl mx-auto px-4 sm:px-5 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div className="min-w-0">
          <Link to="/hq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-1">
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" /> HQ
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-[15px] mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </main>
  </div>
);
export default AdminShell;

export const Skeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="glass p-4 space-y-3" aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-10 rounded-2xl bg-pale/60 animate-pulse" />)}
  </div>
);

export const EmptyState = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="glass p-10 text-center"><p className="font-semibold text-foreground text-lg">{title}</p>{hint && <p className="text-muted-foreground mt-1">{hint}</p>}</div>
);

export const ErrorState = ({ onRetry, message = "We couldn't load this right now." }: { onRetry: () => void; message?: string }) => (
  <div className="glass p-10 text-center" role="alert">
    <p className="font-semibold text-foreground text-lg mb-4">{message}</p>
    <button onClick={onRetry} className="btn-primary">Try again</button>
  </div>
);

export const Initials = ({ name }: { name: string }) => (
  <span aria-hidden="true" className="w-9 h-9 rounded-full bg-pale text-foreground font-bold text-sm flex items-center justify-center shrink-0">
    {name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
  </span>
);
