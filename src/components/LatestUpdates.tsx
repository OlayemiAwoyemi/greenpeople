import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string;
  created_at: string;
  cover_image: string | null;
};

const LatestUpdates = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, author, created_at, cover_image")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-secondary" ref={ref}>
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-12"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-widest mb-3 block">
            Stay Informed
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Latest Updates
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            News and stories from the Green People Movement
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        >
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/updates/${post.slug}`}
              className="bg-background border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow block"
            >
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5">
                <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 break-words hyphens-none" style={{ wordBreak: "normal", overflowWrap: "break-word" }}>
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2 break-words hyphens-none" style={{ wordBreak: "normal", overflowWrap: "break-word" }}>
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FontAwesomeIcon icon={faCalendar} className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString("en-NG", {
                    dateStyle: "medium",
                  })}
                  <span>·</span>
                  <span>{post.author}</span>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        <div className="text-center">
          <Link
            to="/updates"
            className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
          >
            View all updates
            <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestUpdates;
