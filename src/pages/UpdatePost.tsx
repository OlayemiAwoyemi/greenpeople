import { cleanHtml, cleanText } from "@/lib/cleanHtml";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendar, faPen } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";
import GreenFooter from "@/components/GreenFooter";
import { useAdmin } from "@/components/AccessGate";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author: string;
  created_at: string;
  cover_image: string | null;
};

const formatContent = (html: string) => cleanHtml(html);

const UpdatePost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin: hasAccess } = useAdmin();

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setPost(data);
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="mx-auto px-5 max-w-[760px] overflow-hidden">
          <Link to="/updates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Back to updates
          </Link>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading…</div>
          ) : !post ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">Post not found.</p>
              <Link to="/updates" className="text-primary text-sm font-semibold hover:underline">← Back to Updates</Link>
            </div>
          ) : (
            <article className="glass p-6 md:p-10 overflow-hidden">
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-3xl mb-8" width={760} height={320} />
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight text-balance">{cleanText(post.title)}</h1>
                {hasAccess && (
                  <Link
                    to={`/write?edit=${post.id}`}
                    className="shrink-0 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 flex items-center gap-1.5"
                  >
                    <FontAwesomeIcon icon={faPen} className="w-3 h-3" />
                    Edit
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
                <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                {new Date(post.created_at).toLocaleDateString("en-NG", { dateStyle: "long" })}
                <span>·</span>
                <span>{post.author}</span>
                <span>·</span>
                <span>{Math.max(1, Math.round((post.content || "").replace(/<[^>]+>/g, " ").split(/\s+/).length / 200))} min read</span>
              </div>
              <div
                className="article-body prose prose-lg max-w-[680px] text-foreground prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:text-xl prose-blockquote:font-semibold prose-blockquote:not-italic prose-blockquote:text-foreground"
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />
              <div className="mt-10 pt-6 border-t border-pale/50 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground mr-2">Share this update</span>
                {[
                  { l: "X", u: `https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}` },
                  { l: "Facebook", u: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                  { l: "WhatsApp", u: `https://wa.me/?text=${encodeURIComponent(post.title + " " + window.location.href)}` },
                ].map((s) => (
                  <a key={s.l} href={s.u} target="_blank" rel="noopener noreferrer" className="btn-glass !px-4 !text-sm" aria-label={`Share on ${s.l}`}>{s.l}</a>
                ))}
              </div>
            </article>
          )}
        </div>
      </main>
      <GreenFooter />
    </div>
  );
};

export default UpdatePost;
