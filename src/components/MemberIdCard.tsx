import { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import greenLogo from "@/assets/green-logo.png";

/**
 * Green People membership card laid out like a passport data page:
 * header band, portrait, labelled fields and a machine-readable-style strip.
 * It is clearly a Green People membership card (no government marks or
 * national passport codes), drawn at a fixed 420 × 296 so downloads match.
 */

export type MemberIdData = {
  fullName: string;
  surname?: string;
  givenNames?: string;
  gender?: string;
  state?: string;
  lga?: string;
  memberNumber?: number | null;
  issued?: Date | null;
};

export const CARD_W = 420;
export const CARD_H = 296;

const DEEP = "#0E3133";
const LIME = "#9AC31F";
const PAPER = "#F4F9E8";

// Fine wavy security lines, like the guilloche print on a passport page.
const guilloche = (() => {
  const paths: string[] = [];
  for (let i = 0; i < 14; i++) {
    const y = 8 + i * 8;
    paths.push(
      `<path d="M0 ${y} C 35 ${y - 7}, 70 ${y + 7}, 105 ${y} S 175 ${y - 7}, 210 ${y}" fill="none" stroke="${i % 2 ? LIME : DEEP}" stroke-opacity="${i % 2 ? 0.22 : 0.07}" stroke-width="0.7"/>`,
    );
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="210" height="120" viewBox="0 0 210 120">${paths.join("")}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
})();

const mrzClean = (s = "") =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "<").replace(/^<+|<+$/g, "");
const mrzLine = (s: string) => (s + "<".repeat(44)).slice(0, 44);

const splitName = (d: MemberIdData) => {
  if (d.surname) return { surname: d.surname, given: d.givenNames || "" };
  const parts = d.fullName.trim().split(/\s+/);
  if (parts.length < 2) return { surname: parts[0] || "", given: "" };
  return { surname: parts[parts.length - 1], given: parts.slice(0, -1).join(" ") };
};

const initialsOf = (name: string) =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "GP";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

// Shrinks long values (e.g. long LGA names) so they still fit their box.
const fit = (v = "", span: number) => {
  const room = span * 6.4; // characters that fit at full size
  return v.length <= room ? 11.5 : Math.max(8, 11.5 * (room / v.length));
};

const stateLabel = (s?: string) => (s && /federal capital/i.test(s) ? "FCT Abuja" : s);

const Field = ({ label, value, span = 3 }: { label: string; value?: string; span?: number }) => (
  <div style={{ gridColumn: `span ${span}`, minWidth: 0 }}>
    <div style={{ fontSize: 6.5, letterSpacing: "0.08em", color: "#4E6B57", textTransform: "uppercase", lineHeight: "9px" }}>{label}</div>
    <div style={{ fontSize: fit(value, span), fontWeight: 700, color: DEEP, textTransform: "uppercase", lineHeight: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {value || "—"}
    </div>
  </div>
);

export const MemberIdCard = forwardRef<HTMLDivElement, { data: MemberIdData }>(({ data }, ref) => {
  const { surname, given } = splitName(data);
  const num = String(data.memberNumber || 0).padStart(8, "0");
  const gender = data.gender ? data.gender.charAt(0).toUpperCase() : "";
  const line1 = mrzLine(`GPM<NG<${mrzClean(surname)}<<${mrzClean(given)}`);
  const line2 = mrzLine(`GP${num}<${mrzClean(stateLabel(data.state))}<${mrzClean(data.lga)}<<VERIFIED<MEMBER`);

  return (
    <div
      ref={ref}
      style={{
        width: CARD_W, height: CARD_H, position: "relative", overflow: "hidden", borderRadius: 14,
        background: PAPER, backgroundImage: guilloche, backgroundSize: "210px 120px",
        border: `1px solid ${DEEP}22`, fontFamily: "'Inter Tight', system-ui, sans-serif", color: DEEP,
        boxShadow: "0 18px 40px -18px rgba(14,49,51,0.45)",
      }}
    >
      {/* Watermark */}
      <img src={greenLogo} alt="" aria-hidden
        style={{ position: "absolute", right: 22, top: 70, width: 150, height: 150, opacity: 0.07, borderRadius: "50%" }} />
      {/* Security stripe */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg, ${LIME}, #5E8A12)` }} />

      {/* Header band */}
      <div style={{ position: "absolute", left: 6, right: 0, top: 0, height: 44, background: DEEP, display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
        <img src={greenLogo} alt="Green People" style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#fff", fontSize: 12.5, fontWeight: 800, letterSpacing: "0.06em", lineHeight: "15px" }}>GREEN PEOPLE MOVEMENT</div>
          <div style={{ color: LIME, fontSize: 7, letterSpacing: "0.22em", lineHeight: "11px" }}>MEMBERSHIP DATA PAGE</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#ffffff99", fontSize: 6, letterSpacing: "0.12em" }}>MEMBER NO.</div>
          <div style={{ color: "#fff", fontSize: 12, fontWeight: 800, fontFamily: "'Courier New', monospace", letterSpacing: "0.04em" }}>GP-{num}</div>
        </div>
      </div>

      {/* Portrait */}
      <div style={{ position: "absolute", left: 20, top: 56, width: 92, height: 118, borderRadius: 8, overflow: "hidden",
        background: `linear-gradient(160deg, #1B4A4C, ${DEEP})`, border: `2px solid #fff`, boxShadow: `0 0 0 1px ${DEEP}33` }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          color: LIME, fontSize: 38, fontWeight: 800, letterSpacing: "0.02em" }}>{initialsOf(data.fullName)}</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: LIME, color: DEEP, fontSize: 6.5,
          fontWeight: 800, letterSpacing: "0.14em", textAlign: "center", padding: "3px 0" }}>VERIFIED</div>
      </div>
      <div style={{ position: "absolute", left: 20, top: 180, width: 92, textAlign: "center", fontSize: 6.5, color: "#4E6B57", letterSpacing: "0.1em" }}>
        GREENPEOPLE.NG
      </div>

      {/* Fields */}
      <div style={{ position: "absolute", left: 126, right: 16, top: 54, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", columnGap: 10, rowGap: 5 }}>
        <Field label="Type" value="GPM" span={2} />
        <Field label="Code" value="NG" span={2} />
        <Field label="Gender" value={gender} span={2} />
        <Field label="Surname" value={surname} span={6} />
        <Field label="Given names" value={given} span={6} />
        <Field label="State" value={stateLabel(data.state)} />
        <Field label="LGA" value={data.lga} />
        <Field label="Status" value="Verified member" span={data.issued ? 3 : 6} />
        {data.issued && <Field label="Date of joining" value={fmtDate(data.issued)} />}
      </div>

      {/* Machine-readable-style zone */}
      <div style={{ position: "absolute", left: 6, right: 0, bottom: 0, height: 58, background: "#ffffffcc",
        borderTop: `1px solid ${DEEP}1f`, padding: "9px 14px 0", fontFamily: "'Courier New', monospace", fontWeight: 700,
        fontSize: 11.2, letterSpacing: "0.06em", lineHeight: "19px", color: DEEP, whiteSpace: "pre" }}>
        <div>{line1}</div>
        <div>{line2}</div>
      </div>
    </div>
  );
});
MemberIdCard.displayName = "MemberIdCard";

/** Shows the fixed-size card scaled to fit its container. */
export const ScaledMemberIdCard = ({ data }: { data: MemberIdData }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / CARD_W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrap} style={{ width: "100%", maxWidth: CARD_W, margin: "0 auto", height: CARD_H * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: CARD_W }}>
        <MemberIdCard data={data} />
      </div>
    </div>
  );
};

/** An off-screen, unscaled copy used only for the PNG download. */
export const CaptureMemberIdCard = forwardRef<HTMLDivElement, { data: MemberIdData }>(({ data }, ref) =>
  createPortal(
    <div aria-hidden style={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
      <MemberIdCard ref={ref} data={data} />
    </div>,
    document.body,
  ),
);
CaptureMemberIdCard.displayName = "CaptureMemberIdCard";
