// Text pasted into the editor (from Word, WhatsApp, PDFs, Google Docs) often
// carries non-breaking spaces between every word, inline widths, justify
// alignment and empty paragraphs. A paragraph made only of non-breaking
// spaces is one giant "word", so the browser splits it at random letters
// ("ev ery", "t hat"). These helpers turn that back into clean, ordinary text.

// Every invisible "format" character (soft hyphen, zero-width space/joiner,
// direction marks, word joiner, BOM...) except the joiner that emoji need.
const INVISIBLE = /(?!\u200d)[\p{Cf}\u034f\u115f\u1160\u3164]/gu;
// Every non-breaking or exotic space, as a character or an HTML entity.
const NBSP = /&(nbsp|NonBreakingSpace|thinsp|ensp|emsp|hairsp|numsp|puncsp|MediumSpace|ThinSpace|VeryThinSpace|ZeroWidthSpace|NegativeThinSpace|NoBreak|shy|zwnj|zwj|lrm|rlm|#160|#x0*a0|#8239|#x202f|#8203|#x200b|#173|#xad)(;|(?=[^a-z0-9]))|[\p{Zs}\u2028\u2029]/giu;

/** Clean plain text (titles, excerpts). */
export const cleanText = (s: string | null | undefined) =>
  (s || "").replace(INVISIBLE, "").replace(NBSP, (m) => (/shy|zw|lrm|rlm|NoBreak|8203|200b|173|xad/i.test(m) ? "" : " ")).replace(/[ \t]{2,}/g, " ").trim();

/** Clean rich HTML from the editor so it wraps on whole words with even spacing. */
export const cleanHtml = (input: string | null | undefined): string => {
  let html = (input || "")
    .replace(/\r\n?/g, "\n")
    .replace(INVISIBLE, "")
    .replace(NBSP, (m) => (/shy|zw|lrm|rlm|NoBreak|8203|200b|173|xad/i.test(m) ? "" : " "))
    // inline layout that fights the page
    .replace(/\s(style|width|height|align|dir|lang)="[^"]*"/gi, "")
    .replace(/\bql-(align|indent|direction)-[a-z0-9-]+\b/g, "")
    .replace(/\sclass="\s*"/g, "")
    .replace(/<\/?(span|font|o:p)[^>]*>/gi, "")
    .replace(/<wbr\s*\/?>/gi, "");

  // Plain text without block tags: blank lines become paragraphs.
  if (!/<(p|div|h[1-6]|ul|ol|li|blockquote|pre|figure|img)\b/i.test(html)) {
    html = html
      .split(/\n\s*\n+/)
      .map((para) => para.replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean)
      .map((para) => `<p>${para}</p>`)
      .join("");
  }

  html = html
    // divs used as paragraphs
    .replace(/<div(\s[^>]*)?>/gi, "<p>")
    .replace(/<\/div>/gi, "</p>")
    // runs of spaces / newlines inside text
    .replace(/[ \t\n]{2,}/g, " ")
    // no stray space before punctuation ("insecurity ." -> "insecurity.")
    .replace(/ +([.,;:!?)\]])(?=\s|<|$)/g, "$1")
    // more than one <br> in a row is just a gap: end the paragraph instead
    .replace(/(\s*<br\s*\/?>\s*){2,}/gi, "</p><p>")
    // no spaces or <br> hugging the start or end of a block
    .replace(/(<(p|h[1-6]|li|blockquote)(\s[^>]*)?>)(\s|<br\s*\/?>)+/gi, "$1")
    .replace(/(\s|<br\s*\/?>)+(<\/(p|h[1-6]|li|blockquote)>)/gi, "$2")
    // empty paragraphs and headings (only whitespace or <br>)
    .replace(/<(p|h[1-6])(\s[^>]*)?>(\s|<br\s*\/?>)*<\/\1>/gi, "")
    // stray nested paragraphs created above
    .replace(/<p>\s*<p>/gi, "<p>")
    .replace(/<\/p>\s*<\/p>/gi, "</p>")
    .replace(/>\s+</g, "> <")
    .trim();

  return html;
};
