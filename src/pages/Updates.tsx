import { cleanText } from "@/lib/cleanHtml";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPen, faCalendar } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";
import GreenFooter from "@/components/GreenFooter";

type Post = { id: string; title: string; slug: string; excerpt: string | null; author: string; created_at: string; cover_image: string | null };

const Updates = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    supabase.from("blog_posts").select("id, title, slug, excerpt, author, created_at, cover_image, content")
      .eq("published", true).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPosts(data); });
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="section-container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-foreground">Updates</h1>
              <p className="text-lg text-muted-foreground">News and stories from the Green People Movement</p>
            </div>
            <Link to="/write" className="btn-glass">
              <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
              Write
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-base mb-4">No updates yet. Stay tuned!</p>
              <Link to="/write" className="text-primary text-sm font-semibold hover:underline">Write the first update →</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
              <Link key={post.id} to={`/updates/${post.slug}`} className="glass overflow-hidden block transition-transform hover:-translate-y-1">
                  {post.cover_image && (
                    <img src={post.cover_image} alt={cleanText(post.title)} className="w-full h-48 object-cover rounded-t-[26px]" loading="lazy" width={600} height={300} />
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 text-pretty">{cleanText(post.title)}</h2>
                    {post.excerpt && <p className="text-muted-foreground text-sm mb-3 line-clamp-3 text-pretty">{cleanText(post.excerpt)}</p>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                      {new Date(post.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                      <span>·</span>
                      <span>{post.author}</span>
                      {(post as any).content && <><span>·</span><span>{Math.max(1, Math.round(String((post as any).content).replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))} min read</span></>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <GreenFooter />
    </div>
  );
};

export default Updates;
