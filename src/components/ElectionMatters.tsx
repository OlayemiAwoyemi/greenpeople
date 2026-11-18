import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faListCheck } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Reveal, Pop } from "./sky/Reveal";

const episodes = [
  { no: "Episode 01", id: "2027", title: "The 2027 candidates", desc: "Atiku, Makinde, Tinubu and Obi, scored on their records, promises and integrity. Nobody passed zero." },
  { no: "Episode 02", id: "1960", title: "Every leader since 1960", desc: "Sixteen governments in sixty-six years, scored on what they did in office. The best didn't reach five." },
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
              <div className="flex flex-wrap gap-2">
                <Link to={`/election-matters/${e.id}`} className="btn-primary" aria-label={`Full breakdown of ${e.no}: ${e.title}`}>
                  <FontAwesomeIcon icon={faListCheck} className="w-3.5 h-3.5" /> Full breakdown
                </Link>
                <a href="https://instagram.com/greenpeopleng" target="_blank" rel="noopener noreferrer" className="btn-glass" aria-label={`Watch ${e.no}: ${e.title}`}>
                  <FontAwesomeIcon icon={faPlay} className="w-3 h-3" /> Watch
                </a>
              </div>
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
