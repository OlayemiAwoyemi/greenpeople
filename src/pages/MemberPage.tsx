import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { initialsAfterFirst } from "@/lib/textNormalize";
import { tierFor, nextTier } from "@/lib/greenSeeds";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter, faInstagram, faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faSeedling, faExternalLink, faCheck, faBookOpen } from "@fortawesome/free-solid-svg-icons";

type Platform = "x" | "instagram" | "facebook" | "youtube";
type Category = "leadership" | "politics" | "governance" | "life" | "civic_education";

const platformOrder: Platform[] = ["x", "instagram", "facebook", "youtube"];
const platformMeta: Record<Platform, { label: string; icon: typeof faXTwitter; color: string }> = {
  x: { label: "X", icon: faXTwitter, color: "bg-foreground text-background" },
  instagram: { label: "Instagram", icon: faInstagram, color: "bg-gradient-to-br from-pink-500 to-orange-400 text-white" },
  facebook: { label: "Facebook", icon: faFacebook, color: "bg-blue-600 text-white" },
  youtube: { label: "YouTube", icon: faYoutube, color: "bg-red-600 text-white" },
};

const MemberPage = () => {
  const { phone } = useParams<{ phone: string }>();
  const [member, setMember] = useState<{ id: string; full_name: string; phone: string; state: string; lga: string } | null>(null);
  const [posts, setPosts] = useState<{ id: string; platform: Platform; url: string; title: string | null; points: number }[]>([]);
  const [items, setItems] = useState<{ id: string; title: string; description: string | null; url: string | null; category: Category }[]>([]);
  const [clicked, setClicked] = useState<Set<string>>(new Set());
  const [read, setRead] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!phone) return;
      const digits = phone.replace(/\D/g, "");
      // Match phones loosely (member.phone may contain spaces or +234)
      const { data: members } = await supabase.from("members").select("id, full_name, phone, state, lga");
      const m = (members ?? []).find((x) => x.phone.replace(/\D/g, "").endsWith(digits) || digits.endsWith(x.phone.replace(/\D/g, "")));
      if (!m) { setLoading(false); return; }
      setMember(m);

      const [{ data: sp }, { data: ci }, { data: sc }, { data: cr }] = await Promise.all([
        supabase.from("social_posts").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("curriculum_items").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("social_clicks").select("post_id").eq("member_id", m.id),
        supabase.from("curriculum_reads").select("item_id").eq("member_id", m.id),
      ]);
      setPosts((sp ?? []) as typeof posts);
      setItems((ci ?? []) as typeof items);
      setClicked(new Set((sc ?? []).map((c) => c.post_id)));
      setRead(new Set((cr ?? []).map((r) => r.item_id)));
      setLoading(false);
    };
    load();
  }, [phone]);

  const totalPoints =
    posts.filter((p) => clicked.has(p.id)).reduce((s, p) => s + p.points, 0) +
    items.filter((i) => read.has(i.id)).length * 5;

  const handleSocialClick = async (postId: string, points: number, url: string) => {
    if (!member) return;
    if (!clicked.has(postId)) {
      const { error } = await supabase.from("social_clicks").insert({
        member_id: member.id, post_id: postId, points_awarded: points,
      });
      if (!error) setClicked((s) => new Set(s).add(postId));
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRead = async (itemId: string, url: string | null) => {
    if (!member) return;
    if (!read.has(itemId)) {
      const { error } = await supabase.from("curriculum_reads").insert({
        member_id: member.id, item_id: itemId, points_awarded: 5,
      });
      if (!error) setRead((s) => new Set(s).add(itemId));
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Navbar />
        <div className="text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center px-5">
          <h1 className="text-2xl font-bold mb-2">Member not found</h1>
          <p className="text-muted-foreground text-sm mb-6">No member matches that phone number.</p>
          <Link to="/ranks" className="text-primary text-sm font-semibold hover:underline">View the Green Ladder →</Link>
        </div>
      </div>
    );
  }

  const tier = tierFor(totalPoints);
  const next = nextTier(totalPoints);
  const progress = next ? Math.min(100, ((totalPoints - tier.min) / (next.min - tier.min)) * 100) : 100;

  const groupedPosts = platformOrder.map((p) => ({ platform: p, items: posts.filter((x) => x.platform === p) }));
  const groupedClassroom = (["leadership", "politics", "governance", "civic_education", "life"] as Category[]).map((c) => ({
    category: c, items: items.filter((x) => x.category === c),
  }));

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <div className="pt-24 max-w-3xl mx-auto px-5">
        {/* Profile card */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/40 to-background border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl flex-shrink-0">
              {member.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{initialsAfterFirst(member.full_name)}</h1>
              <p className="text-muted-foreground text-xs">{member.lga}, {member.state}</p>
            </div>
            <Link to="/ranks" className="text-xs text-primary font-semibold hover:underline whitespace-nowrap">Leaderboard →</Link>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <FontAwesomeIcon icon={faSeedling} className={`w-5 h-5 ${tier.color}`} />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString("en-NG")}</span>
                <span className="text-sm text-muted-foreground">GreenSeeds</span>
                <span className={`ml-auto text-xs font-bold ${tier.color}`}>{tier.name}</span>
              </div>
            </div>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          {next ? (
            <p className="text-[11px] text-muted-foreground mt-2">{next.min - totalPoints} more seeds to reach <span className={`font-semibold ${next.color}`}>{next.name}</span></p>
          ) : (
            <p className="text-[11px] text-primary mt-2 font-semibold">Top tier reached. Keep planting.</p>
          )}
        </div>

        {/* Social posts */}
        <section className="mb-8">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-widest mb-3">Subscribe · Like · Comment · Share</h2>
          {groupedPosts.every((g) => g.items.length === 0) && (
            <p className="text-sm text-muted-foreground bg-secondary/40 border border-border rounded-xl p-6 text-center">No social posts yet. Check back soon.</p>
          )}
          {groupedPosts.map(({ platform, items: list }) => list.length > 0 && (
            <div key={platform} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${platformMeta[platform].color}`}>
                  <FontAwesomeIcon icon={platformMeta[platform].icon} className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{platformMeta[platform].label}</h3>
              </div>
              <div className="grid gap-2">
                {list.map((p) => {
                  const done = clicked.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSocialClick(p.id, p.points, p.url)}
                      className={`group text-left bg-card border rounded-xl p-3 flex items-center gap-3 hover:bg-secondary/50 transition-all ${done ? "border-primary/40" : "border-border"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        <FontAwesomeIcon icon={done ? faCheck : faExternalLink} className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-foreground truncate">{p.title || p.url}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{p.url}</div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <div className={`text-sm font-bold ${done ? "text-primary" : "text-foreground"}`}>+{p.points}</div>
                        <div className="text-[10px] text-muted-foreground">seeds</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* Green Classroom */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Green Classroom</h2>
          </div>
          {groupedClassroom.every((g) => g.items.length === 0) && (
            <p className="text-sm text-muted-foreground bg-secondary/40 border border-border rounded-xl p-6 text-center">No lessons yet. Check back soon.</p>
          )}
          {groupedClassroom.map(({ category, items: list }) => list.length > 0 && (
            <div key={category} className="mb-4">
              <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">{category.replace("_", " ")}</h3>
              <div className="grid gap-2">
                {list.map((it) => {
                  const done = read.has(it.id);
                  return (
                    <button
                      key={it.id}
                      onClick={() => handleRead(it.id, it.url)}
                      className={`group text-left bg-card border rounded-xl p-3 hover:bg-secondary/50 transition-all ${done ? "border-primary/40" : "border-border"}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                          <FontAwesomeIcon icon={done ? faCheck : faBookOpen} className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground">{it.title}</div>
                          {it.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{it.description}</div>}
                        </div>
                        <div className="text-right whitespace-nowrap">
                          <div className={`text-sm font-bold ${done ? "text-primary" : "text-foreground"}`}>+5</div>
                          <div className="text-[10px] text-muted-foreground">seeds</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default MemberPage;
