import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const Write = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", coverImage: "", author: "Green People Team" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { error } = await supabase.from("blog_posts").insert({
      title: form.title.trim(),
      slug: `${slug}-${Date.now()}`,
      content: form.content.trim(),
      excerpt: form.excerpt.trim() || null,
      cover_image: form.coverImage.trim() || null,
      author: form.author.trim() || "Green People Team",
      published: true,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error publishing", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Published successfully! 🎉" });
    navigate("/updates");
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/updates" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Write an Update</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Title *</label>
            <input required maxLength={200} value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's the update about?" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Excerpt</label>
            <input maxLength={300} value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="A short summary (optional)" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Cover Image URL</label>
            <input value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              placeholder="https://..." className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Author</label>
            <input value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Author name" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Content *</label>
            <textarea required rows={12} value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your update here..."
              className={`${inputClass} resize-y`} />
          </div>
          <button type="submit" disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
            <FontAwesomeIcon icon={faPaperPlane} className="w-3.5 h-3.5" />
            {loading ? "Publishing..." : "Publish Update"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Write;
