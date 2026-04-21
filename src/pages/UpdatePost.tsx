import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCalendar, faPen } from "@fortawesome/free-solid-svg-icons";
import Navbar from "@/components/Navbar";
import GreenFooter from "@/components/GreenFooter";

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

const ACCESS_CODE = "sterces";

const formatContent = (html: string) => {
  // If content already has HTML block tags, just return it
  if (/<(p|div|h[1-6]|ul|ol|blockquote)\b/i.test(html)) return html;
  // Otherwise treat each line break as a paragraph
  return html
    .split(/\n+/)
    .filter((line) => line.trim())
    .map((line) => `<p>${line}</p>`)
    .join("");
};

const UpdatePost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("gp_access");
    if (stored === ACCESS_CODE) setHasAccess(true);
  }, []);

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="section-container max-w-3xl overflow-hidden">
          <Link to="/updates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
            Back to Updates
          </Link>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading…</div>
          ) : !post ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">Post not found.</p>
              <Link to="/updates" className="text-primary text-sm font-semibold hover:underline">← Back to Updates</Link>
            </div>
          ) : (
            <article className="overflow-hidden">
              {post.cover_image && (
                <img src={post.cover_image} alt={post.title} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />
              )}
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{post.title}</h1>
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
              </div>
              <div
                className="prose prose-sm max-w-none text-foreground/90 overflow-hidden [&_img]:rounded-xl [&_img]:my-4 [&_p]:mb-4 [&_p]:leading-relaxed"
                style={{ wordBreak: "normal", overflowWrap: "break-word", hyphens: "none", textAlign: "left", WebkitHyphens: "none", msHyphens: "none" } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
              />
            </article>
          )}
        </div>
      </main>
      <GreenFooter />
    </div>
  );
};

export default UpdatePost;
