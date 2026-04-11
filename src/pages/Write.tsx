import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPaperPlane, faImage, faSave } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const WriteContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [form, setForm] = useState({ title: "", content: "", excerpt: "", coverImage: "", author: "Green People Team" });

  // Load existing post when editing
  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("id", editId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (data) {
          setForm({
            title: data.title,
            content: data.content,
            excerpt: data.excerpt || "",
            coverImage: data.cover_image || "",
            author: data.author,
          });
        } else if (error) {
          toast({ title: "Could not load post", description: error.message, variant: "destructive" });
        }
        setFetching(false);
      });
  }, [editId]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `covers/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("blog-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(path);
    setForm({ ...form, coverImage: urlData.publicUrl });
    setUploading(false);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link", "image", "video"],
        ["clean"],
      ],
    },
  }), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setLoading(true);

    if (editId) {
      // Update existing post
      const { error } = await supabase.from("blog_posts").update({
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt.trim() || null,
        cover_image: form.coverImage.trim() || null,
        author: form.author.trim() || "Green People Team",
      }).eq("id", editId);
      setLoading(false);
      if (error) {
        toast({ title: "Error updating", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Update saved! ✅" });
      navigate("/updates");
    } else {
      // Create new post
      const slug = form.title.toLowerCase().replace(/[^a-z\s-]+/g, "").replace(/\s+/g, "-").replace(/(^-|-$)+/g, "");
      const { error } = await supabase.from("blog_posts").insert({
        title: form.title.trim(),
        slug,
        content: form.content,
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
    }
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/updates" className="text-muted-foreground hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {editId ? "Edit Update" : "Write an Update"}
          </h1>
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

          {/* Cover Image Upload */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Cover Image</label>
            {form.coverImage ? (
              <div className="relative rounded-xl overflow-hidden border border-border mb-2">
                <img src={form.coverImage} alt="Cover" className="w-full h-48 object-cover" />
                <button type="button" onClick={() => setForm({ ...form, coverImage: "" })}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground w-8 h-8 rounded-full text-xs hover:bg-background">
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/40 transition-colors bg-secondary/30">
                <FontAwesomeIcon icon={faImage} className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Click to upload cover image"}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Author</label>
            <input value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Author name" className={inputClass} />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Content *</label>
            <div className="rounded-xl overflow-hidden border border-border bg-background [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-secondary/30 [&_.ql-container]:border-0 [&_.ql-container]:min-h-[300px] [&_.ql-editor]:text-sm [&_.ql-editor]:text-foreground">
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
                modules={modules}
                placeholder="Write your update here..."
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
            <FontAwesomeIcon icon={editId ? faSave : faPaperPlane} className="w-3.5 h-3.5" />
            {loading
              ? (editId ? "Saving…" : "Publishing…")
              : (editId ? "Save Changes" : "Publish Update")}
          </button>
        </form>
      </div>
    </div>
  );
};

const Write = () => (
  <AccessGate>
    <WriteContent />
  </AccessGate>
);

export default Write;
