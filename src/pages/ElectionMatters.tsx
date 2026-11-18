import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useInView, animate, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft, faArrowRight, faShareNodes, faLink, faCheck, faScaleBalanced,
  faArrowUpRightFromSquare, faQuoteLeft, faCircleInfo, faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import Navbar from "@/components/Navbar";
import GreenFooter from "@/components/GreenFooter";
import { Reveal, Pop } from "@/components/sky/Reveal";
import { WatchButton } from "@/components/WatchEpisode";
import { AS_OF, EPISODES, EPISODE_1960, EPISODE_2027, type Episode, type Person } from "@/data/electionMatters";

/* ---------- helpers ---------- */

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const s = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : "0";
};
const tone = (n: number) => (n > 0 ? "text-olive" : n < 0 ? "text-destructive" : "text-foreground");
const ranked = (ep: Episode) => [...ep.people].sort((a, b) => b.final - a.final);
const rankOf = (ep: Episode, slug: string) => ranked(ep).findIndex((p) => p.slug === slug) + 1;
const SITE = "https://greenpeople.ng";

const usePageMeta = (title: string, description: string) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    const tag = document.querySelector('meta[name="description"]');
    const prevDesc = tag?.getAttribute("content") ?? null;
    tag?.setAttribute("content", description);
    return () => {
      document.title = prev;
      if (tag && prevDesc !== null) tag.setAttribute("content", prevDesc);
    };
  }, [title, description]);
};

/** Animated signed score that handles halves and negatives. */
const Score = ({ value, className }: { value: number; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(value); return; }
    const c = animate(0, value, { duration: 1.1, ease: "easeOut", onUpdate: (v) => setN(Math.round(v * 2) / 2) });
    return () => c.stop();
  }, [inView, value, reduce]);
  return <span ref={ref} className={className}>{fmt(n)}</span>;
};

/* ---------- share ---------- */

const ShareBar = ({ path, text }: { path: string; text: string }) => {
  const url = `${SITE}${path}`;
  const [copied, setCopied] = useState(false);
  const native = typeof navigator !== "undefined" && "share" in navigator;
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      {native && (
        <button type="button" className="btn-primary !min-h-11" onClick={() => navigator.share({ title: text, text, url }).catch(() => {})}>
          <FontAwesomeIcon icon={faShareNodes} className="w-4 h-4" /> Share
        </button>
      )}
      <a className="btn-glass !min-h-11" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faWhatsapp} className="w-4 h-4 text-[#25D366]" /> WhatsApp
      </a>
      <a className="btn-glass !min-h-11" href={`https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
        <FontAwesomeIcon icon={faXTwitter} className="w-4 h-4" />
      </a>
      <button type="button" className="btn-glass !min-h-11" onClick={copy} aria-live="polite">
        <FontAwesomeIcon icon={copied ? faCheck : faLink} className="w-4 h-4" /> {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
};

/* ---------- scoreboard ---------- */

/** Short label like the video: "Obasanjo '99", "Buhari '84", "Tinubu (so far)". */
const shortName = (p: Person) => {
  const m = p.name.match(/^(.*?)\s*\((military|civilian|so far)\)$/);
  if (!m) return p.name;
  const last = m[1].trim().split(" ").pop();
  if (m[2] === "so far") return `${last} · so far`;
  const yr = p.meta.match(/(\d{4})/);
  return yr ? `${last} '${yr[1].slice(2)}` : `${last}`;
};

const Scoreboard = ({ ep, order }: { ep: Episode; order: Person[] }) => {
  const max = Math.max(10, ...ep.people.map((p) => Math.ceil(Math.abs(p.final))));
  const pos = (v: number) => 50 + (v / max) * 50; // % from left
  return (
    <div className="glass px-4 py-5 sm:px-7 sm:py-7" role="img" aria-label={`Final scores: ${order.map((p) => `${p.name} ${fmt(p.final)}`).join(", ")}`}>
      <ol className="space-y-1">
        {order.map((p, i) => {
          const x = pos(p.final);
          const col = p.final > 0 ? "hsl(var(--olive))" : p.final < 0 ? "hsl(var(--destructive))" : "hsl(var(--deep) / 0.45)";
          return (
            <li key={p.slug}>
              <a href={`#${p.slug}`} className="group grid grid-cols-[1.25rem_minmax(0,7.5rem)_1fr] sm:grid-cols-[1.5rem_minmax(0,11rem)_1fr] items-center gap-2 sm:gap-4 rounded-lg py-1.5 hover:bg-white/40 transition-colors">
                <span className="text-[11px] tabular-nums text-muted-foreground/70 text-right">{i + 1}</span>
                <span className="truncate text-[13px] sm:text-sm font-medium text-foreground/90 text-right group-hover:text-foreground">{shortName(p)}</span>
                <span className="relative h-6">
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-deep/[0.08]" />
                  <span className="absolute left-1/2 top-0 bottom-0 w-px bg-deep/20" />
                  <motion.span className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full"
                    style={{ background: col, left: `${Math.min(50, x)}%` }}
                    initial={{ width: 0 }} whileInView={{ width: `${Math.abs(x - 50)}%` }} viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.04 * i }} />
                  <motion.span className="absolute top-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                    style={{ boxShadow: `0 0 0 2px ${col}`, left: `${x}%` }}
                    initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.04 * i + 0.5 }} />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold tabular-nums ${tone(p.final)}`}
                    style={p.final < 0 ? { right: `calc(${100 - x}% + 10px)` } : { left: `calc(${x}% + 10px)` }}>{fmt(p.final)}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 grid grid-cols-[1.25rem_minmax(0,7.5rem)_1fr] sm:grid-cols-[1.5rem_minmax(0,11rem)_1fr] gap-2 sm:gap-4 text-[10px] tabular-nums text-muted-foreground/70">
        <span /><span />
        <span className="flex justify-between"><span>−{max}</span><span>0</span><span>+{max}</span></span>
      </div>
    </div>
  );
};

/* ---------- running total ---------- */

const RunningTotal = ({ person }: { person: Person }) => {
  const steps = useMemo(() => {
    let t = 0;
    return [0, ...person.beats.map((b) => (t += b.points))];
  }, [person]);
  const lo = Math.min(...steps, -1), hi = Math.max(...steps, 1);
  const W = 240, H = 64, pad = 6;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (steps.length - 1);
  const y = (v: number) => pad + ((hi - v) * (H - pad * 2)) / (hi - lo);
  const d = steps.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[240px] h-16" role="img" aria-label={`Running total: ${steps.slice(1).map(fmt).join(", then ")}`}>
      <line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke="currentColor" className="text-deep/25" strokeDasharray="3 3" />
      <motion.path d={d} fill="none" stroke="hsl(var(--deep))" strokeWidth={2} strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: "easeInOut" }} />
      {steps.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === steps.length - 1 ? 4 : 2.5}
          fill={i === steps.length - 1 ? (v >= 0 ? "hsl(var(--olive))" : "hsl(var(--destructive))") : "hsl(var(--deep))"} />
      ))}
    </svg>
  );
};

/* ---------- person card ---------- */

const PersonCard = ({ ep, person, index }: { ep: Episode; person: Person; index: number }) => {
  const [open, setOpen] = useState(true);
  const rank = rankOf(ep, person.slug);
  let running = 0;
  return (
    <Reveal>
      <article id={person.slug} className="glass scroll-mt-28 p-5 sm:p-7">
        <header className="flex flex-wrap items-start gap-4 sm:gap-6">
          <div className="flex-1 min-w-[12rem]">
            <div className="flex items-center gap-2 mb-2 text-[12px] font-semibold text-muted-foreground">
              <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-deep text-white">{ep.id === "1960" ? `${index + 1}` : `#${rank}`}</span>
              <span>{ep.id === "1960" ? `Ranked #${rank} of ${ep.people.length}` : `Ranked #${rank} of ${ep.people.length}`}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{person.name}</h3>
            <p className="text-muted-foreground text-sm mt-1">{person.meta}</p>
            <p className="mt-2 inline-flex rounded-full bg-pale/70 px-3 py-1 text-[12px] font-semibold text-foreground">{person.verdict}</p>
          </div>
          <div className="flex items-center gap-4">
            <RunningTotal person={person} />
            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Final score</div>
              <Score value={person.final} className={`block text-5xl font-black tabular-nums leading-none ${tone(person.final)}`} />
            </div>
          </div>
        </header>

        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground min-h-11">
          <FontAwesomeIcon icon={faChevronDown} className={`w-3 h-3 transition-transform ${open ? "" : "-rotate-90"}`} />
          {open ? "Hide the breakdown" : `Show the breakdown (${person.beats.length} steps)`}
        </button>

        {open && (
          <ol className="mt-3 space-y-3">
            {person.beats.map((b, i) => {
              running += b.points;
              return (
                <motion.li key={i} className="rounded-2xl bg-white/60 p-4 sm:p-5"
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.35, delay: 0.05 * i }}>
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 inline-flex items-center justify-center h-9 min-w-[3.25rem] px-2 rounded-xl font-black tabular-nums text-sm ${b.points > 0 ? "bg-lime/30 text-olive" : "bg-destructive/10 text-destructive"}`}>
                      {fmt(b.points)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <h4 className="font-bold text-foreground leading-snug">{b.title}</h4>
                        <span className="text-[12px] text-muted-foreground tabular-nums">Total so far {fmt(running)}</span>
                      </div>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/85">{b.why}</p>
                      {b.theirSide && (
                        <p className="mt-2.5 flex gap-2 rounded-xl bg-mist/80 px-3 py-2 text-sm text-foreground/85">
                          <FontAwesomeIcon icon={faScaleBalanced} className="w-3.5 h-3.5 mt-1 text-olive shrink-0" />
                          <span><strong className="font-semibold">Their side:</strong> {b.theirSide}</span>
                        </p>
                      )}
                      <ul className="mt-2.5 flex flex-wrap gap-1.5">
                        {b.sources.map((s) => (
                          <li key={s.url}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-white transition-colors">
                              {s.label}
                              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-2.5 h-2.5 text-muted-foreground" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        )}
        {person.note && <p className="mt-3 text-sm text-muted-foreground flex gap-2"><FontAwesomeIcon icon={faCircleInfo} className="w-3.5 h-3.5 mt-0.5" />{person.note}</p>}
      </article>
    </Reveal>
  );
};

/* ---------- episode page ---------- */

const ProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div aria-hidden style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 origin-left bg-gradient-to-r from-lime to-olive z-[60]" />;
};

export const EpisodePage = () => {
  const { episode } = useParams<{ episode: string }>();
  const ep = episode === "2027" ? EPISODE_2027 : episode === "1960" ? EPISODE_1960 : null;
  const title = ep ? `Election Matters ${ep.number}: ${ep.title} — full breakdown` : "Election Matters";
  usePageMeta(title, ep ? `${ep.strap} Every score, every source and why each point landed.` : "");
  if (!ep) return <Navigate to="/election-matters" replace />;

  const other = ep.id === "2027" ? EPISODE_1960 : EPISODE_2027;
  const cards = ep.id === "1960" ? ep.people : ranked(ep);
  const shareText = `Election Matters ${ep.number}: ${ep.title}. Every score, every source.`;

  return (
    <div className="min-h-screen">
      <ProgressBar />
      <Navbar />
      <main className="pt-28 pb-20">
        {/* hero */}
        <section className="max-w-5xl mx-auto px-5">
          <Link to="/election-matters" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground min-h-11">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" /> All episodes
          </Link>
          <Reveal>
            <p className="eyebrow mt-2">Election Matters · Episode {ep.number}</p>
            <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.02]">{ep.title}</h1>
            <p className="mt-4 text-lg sm:text-xl text-foreground/80 max-w-2xl">{ep.strap}</p>
            <p className="mt-3 text-sm text-muted-foreground">Full breakdown · scores, reasons and sources · as of {AS_OF}</p>
          </Reveal>
          <Reveal delay={0.1} className="mt-6 flex flex-wrap items-center gap-2">
            <WatchButton id={ep.id} className="btn-primary !min-h-11" label="Watch the episode" />
            <ShareBar path={ep.sharePath} text={shareText} />
          </Reveal>
        </section>

        {/* board */}
        <section className="max-w-5xl mx-auto px-5 mt-10" aria-labelledby="board">
          <h2 id="board" className="text-xl font-bold text-foreground mb-3">Final scores</h2>
          <Scoreboard ep={ep} order={ranked(ep)} />
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {ep.takeaways.map((t, i) => (
              <Pop key={t} delay={0.06 * i}>
                <p className="glass h-full p-4 text-[15px] font-semibold text-foreground flex gap-2">
                  <FontAwesomeIcon icon={faQuoteLeft} className="w-3.5 h-3.5 mt-1 text-olive shrink-0" />{t}
                </p>
              </Pop>
            ))}
          </div>
        </section>

        {/* method */}
        <section className="max-w-5xl mx-auto px-5 mt-14" aria-labelledby="method">
          <Reveal>
            <h2 id="method" className="text-2xl sm:text-3xl font-bold text-foreground">How we scored</h2>
            <p className="mt-2 text-foreground/80 max-w-3xl">{ep.intro} No points for tribe, religion, region or party.</p>
          </Reveal>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ep.rules.map((r, i) => (
              <Pop key={r.label} delay={0.05 * i}>
                <div className="glass h-full p-5">
                  <div className="text-2xl font-black text-foreground tabular-nums">{r.points}</div>
                  <div className="mt-1 font-semibold text-foreground">{r.label}</div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{r.why}</p>
                </div>
              </Pop>
            ))}
          </div>
        </section>

        {/* jump nav */}
        <nav aria-label="Jump to a person" className="sticky top-20 z-30 mt-12">
          <div className="max-w-5xl mx-auto px-5">
            <div className="glass !rounded-full px-2 py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              <WatchButton id={ep.id} className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-lime px-3.5 py-2 text-[13px] font-semibold text-deep whitespace-nowrap" />
              {cards.map((p) => (
                <a key={p.slug} href={`#${p.slug}`} className="shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold text-foreground hover:bg-white/80 whitespace-nowrap">
                  {p.name.replace(/ \((military|civilian|so far)\)/, (m) => m.replace("(", "· ").replace(")", ""))} <span className={`ml-1 tabular-nums ${tone(p.final)}`}>{fmt(p.final)}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* people */}
        <section className="max-w-5xl mx-auto px-5 mt-6 space-y-5" aria-label="Breakdown by person">
          {cards.map((p, i) => <PersonCard key={p.slug} ep={ep} person={p} index={i} />)}
        </section>

        {/* fairness */}
        <section className="max-w-5xl mx-auto px-5 mt-14">
          <Reveal>
            <div className="glass p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-foreground">Read this before you argue</h2>
              <ul className="mt-3 space-y-2 text-foreground/85 text-[15px] leading-relaxed list-disc pl-5">
                <li>These scores are Green People's own weighting of public records. Another fair person could weigh them differently.</li>
                <li>Allegations are not convictions. Where someone was never charged, we say so, and we state their side.</li>
                <li>Figures change. Everything here is checked as of {AS_OF}.</li>
                <li>Think a score is wrong? Tell us which beat, and send a source. We correct mistakes in public.</li>
              </ul>
            </div>
          </Reveal>
        </section>

        {/* next */}
        <section className="max-w-5xl mx-auto px-5 mt-10 grid gap-4 sm:grid-cols-2">
          <div className="glass p-6 group">
            <p className="eyebrow">Episode {other.number}</p>
            <p className="mt-2 text-xl font-bold text-foreground">{other.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{other.strap}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <WatchButton id={other.id} className="btn-primary !min-h-11" />
              <Link to={`/election-matters/${other.id}`} className="btn-glass !min-h-11">Full breakdown <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /></Link>
            </div>
          </div>
          <div className="glass p-6">
            <p className="eyebrow">Your vote counts</p>
            <p className="mt-2 text-xl font-bold text-foreground">Don't sell your vote. Check your PVC.</p>
            <p className="mt-1 text-sm text-muted-foreground">The presidential election is on 16 January 2027. Take your family to vote.</p>
            <Link to="/#join" className="btn-primary mt-4 !min-h-11">Join Green People</Link>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-5 mt-8"><ShareBar path={ep.sharePath} text={shareText} /></section>
      </main>
      <GreenFooter />
    </div>
  );
};

/* ---------- hub ---------- */

export const ElectionMattersHub = () => {
  usePageMeta("Election Matters — every score, every source | Green People", "The full breakdowns behind Election Matters: the 2027 candidates and every Nigerian leader since 1960.");
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-20 max-w-5xl mx-auto px-5">
        <Reveal>
          <p className="eyebrow">Election Matters · from Green People</p>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.02]">Every score. Every source.</h1>
          <p className="mt-4 text-lg text-foreground/80 max-w-2xl">The full breakdowns behind our videos: what each person did, what it cost Nigerians, and why each point landed where it did.</p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {EPISODES.map((ep, i) => {
            const top = ranked(ep)[0], bottom = ranked(ep).at(-1)!;
            return (
              <Pop key={ep.id} delay={0.08 * i}>
                <article className="glass h-full p-6 sm:p-8 flex flex-col">
                  <p className="eyebrow">Episode {ep.number}</p>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">{ep.title}</h2>
                  <p className="mt-2 text-foreground/75">{ep.strap}</p>
                  <dl className="mt-5 flex-1 grid content-start grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/60 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Top</dt>
                      <dd className="mt-1 font-semibold text-foreground truncate">{top.name}</dd>
                      <dd><Score value={top.final} className={`text-3xl font-black tabular-nums ${tone(top.final)}`} /></dd>
                    </div>
                    <div className="rounded-2xl bg-white/60 p-3">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bottom</dt>
                      <dd className="mt-1 font-semibold text-foreground truncate">{bottom.name}</dd>
                      <dd><Score value={bottom.final} className={`text-3xl font-black tabular-nums ${tone(bottom.final)}`} /></dd>
                    </div>
                  </dl>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <WatchButton id={ep.id} className="btn-primary !min-h-11" />
                    <Link to={`/election-matters/${ep.id}`} className="btn-glass !min-h-11">Full breakdown <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" /></Link>
                  </div>
                </article>
              </Pop>
            );
          })}
        </div>
        <div className="mt-8"><ShareBar path="/em" text="Election Matters: every score, every source." /></div>
      </main>
      <GreenFooter />
    </div>
  );
};
