import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faYoutube, faXTwitter } from "@fortawesome/free-brands-svg-icons";

/** Episode videos, self-hosted so they always play, on any device. */
export const EPISODE_VIDEOS: Record<string, { src: string; poster: string; number: string; title: string }> = {
  "2027": { src: "/em/video/ep01.mp4", poster: "/em/video/ep01.jpg", number: "01", title: "The 2027 candidates" },
  "1960": { src: "/em/video/ep02.mp4", poster: "/em/video/ep02.jpg", number: "02", title: "Every leader since 1960" },
};

const SOCIALS = [
  { href: "https://youtube.com/@greenpeopleng", icon: faYoutube, label: "YouTube" },
  { href: "https://instagram.com/greenpeopleng", icon: faInstagram, label: "Instagram" },
  { href: "https://x.com/greenpeopleng", icon: faXTwitter, label: "X" },
];

const Player = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const v = EPISODE_VIDEOS[id];
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Election Matters ${v.number}: ${v.title}`}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-deep/70 backdrop-blur-md animate-in fade-in-0"
      onClick={onClose}>
      <div className="relative w-full max-w-[min(420px,calc((100dvh-9rem)*9/16))]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <p className="text-sm font-semibold truncate">Episode {v.number} · {v.title}</p>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close video"
            className="shrink-0 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors">
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>
        <video src={v.src} poster={v.poster} controls autoPlay playsInline preload="metadata"
          className="w-full aspect-[9/16] rounded-3xl bg-black shadow-2xl object-cover" />
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="text-xs text-white/70 mr-1">Also on</span>
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Green People on ${s.label}`}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors">
              <FontAwesomeIcon icon={s.icon} className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
};

/** "Watch" button that plays an Election Matters episode in place. */
export const WatchButton = ({ id, className = "btn-glass", label = "Watch", autoOpen = false }: { id: string; className?: string; label?: string; autoOpen?: boolean }) => {
  const [open, setOpen] = useState(autoOpen);
  const v = EPISODE_VIDEOS[id];
  if (!v) return null;
  return (
    <>
      <button type="button" className={className} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        aria-label={`Watch Election Matters episode ${v.number}: ${v.title}`}>
        <FontAwesomeIcon icon={faPlay} className="w-3 h-3" /> {label}
      </button>
      {open && <Player id={id} onClose={() => setOpen(false)} />}
    </>
  );
};
