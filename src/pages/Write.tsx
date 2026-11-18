import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faImage, faSave, faEye, faPen, faXmark } from "@fortawesome/free-solid-svg-icons";
import AccessGate from "@/components/AccessGate";
import AdminShell, { Skeleton } from "@/components/admin/AdminShell";
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
  const [mode, setMode] = useState<"write" | "preview">("write");
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

  const inputClass = "w-full bg-white/70 border border-pale rounded-2xl px-4 py-3 min-h-11 text-base md:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-[3px] focus:ring-primary/60";
  const labelClass = "text-foreground text-sm font-semibold mb-1.5 block";
  const words = form.content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  const title = editId ? "Edit update" : "Write an update";
  if (fetching) return <AdminShell title={title}><Skeleton rows={6} /></AdminShell>;

  const submitButton = (
    <button type="submit" form="write-form" disabled={loading} className="btn-primary !min-h-11 disabled:opacity-60">
      <FontAwesomeIcon icon={editId ? faSave : faPaperPlane} className="w-3.5 h-3.5" />
      {loading ? (editId ? "Saving…" : "Publishing…") : (editId ? "Save changes" : "Publish update")}
    </button>
  );

  const preview = (
    <article className="glass overflow-hidden">
      {form.coverImage
        ? <img src={form.coverImage} alt="" className="w-full aspect-[16/9] object-cover" />
        : <div className="w-full aspect-[16/9] bg-gradient-to-br from-pale to-mist flex items-center justify-center text-sm text-muted-foreground">No cover image yet</div>}
      <div className="p-5 sm:p-7">
        <p className="eyebrow">Update</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground leading-tight break-words">{form.title || "Your headline appears here"}</h2>
        {form.excerpt && <p className="mt-2 text-foreground/75">{form.excerpt}</p>}
        <p className="mt-3 text-xs text-muted-foreground">{form.author || "Green People Team"} · {minutes} min read</p>
        <div className="mt-5 prose prose-sm sm:prose-base max-w-none prose-headings:text-foreground prose-p:text-foreground/85 prose-a:text-olive break-words"
          dangerouslySetInnerHTML={{ __html: form.content || "<p>Start writing and your article will appear here, just as readers will see it.</p>" }} />
      </div>
    </article>
  );

  return (
    <AdminShell title={title} subtitle={`${words.toLocaleString("en-NG")} words · about ${minutes} min read`} actions={submitButton}>
      {/* phones: switch between writing and preview */}
      <div className="lg:hidden flex gap-1 bg-mist/80 rounded-full p-1 w-max mb-4" role="tablist">
        {(["write", "preview"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2 ${mode === m ? "bg-white shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <FontAwesomeIcon icon={m === "write" ? faPen : faEye} className="w-3 h-3" /> {m === "write" ? "Write" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <form id="write-form" onSubmit={handleSubmit} className={`glass p-5 sm:p-6 space-y-5 ${mode === "preview" ? "hidden lg:block" : ""}`}>
          <div>
            <label htmlFor="w-title" className={labelClass}>Title</label>
            <input id="w-title" required maxLength={200} value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What's the update about?" className={inputClass} />
          </div>
          <div>
            <label htmlFor="w-excerpt" className={labelClass}>Short summary <span className="font-normal text-muted-foreground">(optional)</span></label>
            <input id="w-excerpt" maxLength={300} value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="One or two lines shown on the updates list" className={inputClass} />
          </div>
          <div>
            <span className={labelClass}>Cover image</span>
            {form.coverImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-pale">
                <img src={form.coverImage} alt="Cover" className="w-full h-44 object-cover" />
                <button type="button" onClick={() => setForm({ ...form, coverImage: "" })} aria-label="Remove cover image"
                  className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow">
                  <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-pale rounded-2xl cursor-pointer hover:border-olive/40 transition-colors bg-white/40">
                <FontAwesomeIcon icon={faImage} className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{uploading ? "Uploading…" : "Tap to upload a cover image"}</span>
                <input type="file" accept="image/*" onChange={handleCoverUpload} className="sr-only" disabled={uploading} />
              </label>
            )}
          </div>
          <div>
            <label htmlFor="w-author" className={labelClass}>Author</label>
            <input id="w-author" value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Author name" className={inputClass} />
          </div>
          <div>
            <span className={labelClass}>Article</span>
            <div className="rounded-2xl overflow-hidden border border-pale bg-white/80 [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-pale [&_.ql-toolbar]:bg-mist/60 [&_.ql-container]:border-0 [&_.ql-container]:min-h-[320px] [&_.ql-editor]:text-base [&_.ql-editor]:text-foreground">
              <ReactQuill theme="snow" value={form.content} onChange={(val) => setForm({ ...form, content: val })}
                modules={modules} placeholder="Write your update here…" />
            </div>
          </div>
          <div className="lg:hidden">{submitButton}</div>
        </form>

        <div className={`lg:sticky lg:top-28 ${mode === "write" ? "hidden lg:block" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 hidden lg:block">Live preview</p>
          {preview}
        </div>
      </div>
    </AdminShell>
  );
};

const Write = () => (
  <AccessGate>
    <WriteContent />
  </AccessGate>
);

export default Write;
