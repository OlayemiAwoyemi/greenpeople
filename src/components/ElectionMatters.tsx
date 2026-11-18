import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { Reveal, Pop } from "./sky/Reveal";

const episodes = [
  { no: "Episode 01", title: "The 2027 Scorecard", desc: "Where Nigeria stands today — the numbers that should shape every vote in 2027." },
  { no: "Episode 02", title: "The Leaders Scorecard", desc: "How the people asking for your vote measure up on public records, promises and delivery." },
];

const ElectionMatters = () => (
  <section id="election-matters" className="py-20 md:py-28" aria-labelledby="em-title">
    <div className="section-container">
      <Reveal className="text-center max-w-2xl mx-auto mb-12">
        <span className="eyebrow">Broadcast series</span>
        <h2 id="em-title" className="text-3xl md:text-[2.75rem] font-bold text-foreground mb-3">Election Matters</h2>
        <p className="text-muted-foreground text-lg">A Green People broadcast on everything about the coming elections</p>
      </Reveal>
      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {episodes.map((e, i) => (
          <Pop key={e.no} delay={i * 0.08}>
            <article className="glass p-7 h-full flex flex-col">
              <span className="text-sm font-semibold text-olive mb-2">{e.no}</span>
              <h3 className="text-2xl font-bold text-foreground mb-2">{e.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-6 flex-1">{e.desc}</p>
              <a href="https://instagram.com/greenpeopleng" target="_blank" rel="noopener noreferrer" className="btn-primary self-start" aria-label={`Watch ${e.no}: ${e.title} on Instagram`}>
                <FontAwesomeIcon icon={faPlay} className="w-3 h-3" /> Watch
              </a>
            </article>
          </Pop>
        ))}
      </div>
      <p className="text-center text-muted-foreground text-sm mt-8 max-w-xl mx-auto">
        Scores are Green People's own weighting of public records. Allegations are not convictions.
      </p>
    </div>
  </section>
);
export default ElectionMatters;
