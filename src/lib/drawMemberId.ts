import greenLogo from "@/assets/green-logo.png";
import {
  CARD_W, CARD_H, DEEP, LIME, type MemberIdData,
  splitName, initialsOf, mrzClean, mrzLine, fmtDate, stateLabel,
} from "@/components/MemberIdCard";

/**
 * The Green People membership ID, painted directly onto a canvas.
 * One drawing is used both on screen and for the download, so they always match.
 * Layout: 420 × 296 units on a 20-unit margin and a 6-column field grid.
 */
const SCALE = 3;
const FONT = "'Inter Tight', 'Inter', system-ui, -apple-system, sans-serif";
const MONO = "'OCR B', 'OCR-B', 'Courier New', ui-monospace, monospace";
const INK = DEEP;            // #0E3133
const MUTED = "#5B7568";
const PAPER_TOP = "#FBFDF6";
const PAPER_BOTTOM = "#EEF5E2";
const OLIVE = "#5E8A12";

const M = 20;                // outer margin
const HEADER_H = 46;
const MRZ_H = 54;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const rounded = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

const tracked = (c: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "right" | "center" = "left") => {
  const chars = [...text];
  const width = chars.reduce((w, ch) => w + c.measureText(ch).width + spacing, -spacing);
  let cx = align === "right" ? x - width : align === "center" ? x - width / 2 : x;
  const prev = c.textAlign;
  c.textAlign = "left";
  for (const ch of chars) { c.fillText(ch, cx, y); cx += c.measureText(ch).width + spacing; }
  c.textAlign = prev;
};

/** Writes text, shrinking it until it fits `maxW`. */
const fit = (c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, size: number, weight = 650, family = FONT, min = 7) => {
  let s = size;
  c.font = `${weight} ${s}px ${family}`;
  while (c.measureText(text).width > maxW && s > min) { s -= 0.25; c.font = `${weight} ${s}px ${family}`; }
  c.fillText(text, x, y);
};

/** Fine engraved rosette, like the security print on a banknote. */
const rosette = (c: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  c.save();
  c.lineWidth = 0.35;
  for (let k = 0; k < 3; k++) {
    const R = r - k * 9, rr = R * 0.36, d = R * 0.52;
    c.strokeStyle = k === 1 ? "rgba(94,138,18,0.20)" : "rgba(14,49,51,0.09)";
    c.beginPath();
    for (let t = 0; t <= Math.PI * 2 * 9 + 0.01; t += 0.02) {
      const x = (R - rr) * Math.cos(t) + d * Math.cos(((R - rr) / rr) * t);
      const y = (R - rr) * Math.sin(t) - d * Math.sin(((R - rr) / rr) * t);
      const sc = r / (R + d - rr + 4);
      if (t === 0) c.moveTo(cx + x * sc, cy + y * sc); else c.lineTo(cx + x * sc, cy + y * sc);
    }
    c.stroke();
  }
  c.restore();
};

export async function drawMemberIdCanvas(data: MemberIdData): Promise<HTMLCanvasElement> {
  try { await document.fonts?.ready; } catch { /* ignore */ }
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const c = canvas.getContext("2d")!;
  c.scale(SCALE, SCALE);

  const { surname, given } = splitName(data);
  const num = String(data.memberNumber || 0).padStart(8, "0");
  const gender = data.gender ? (data.gender.toLowerCase().startsWith("f") ? "F" : data.gender.toLowerCase().startsWith("m") ? "M" : data.gender.charAt(0).toUpperCase()) : "—";
  const logo = await loadImage(greenLogo);

  // ---- card body ----
  rounded(c, 0, 0, CARD_W, CARD_H, 16);
  c.save();
  c.clip();
  const paper = c.createLinearGradient(0, 0, CARD_W, CARD_H);
  paper.addColorStop(0, PAPER_TOP); paper.addColorStop(1, PAPER_BOTTOM);
  c.fillStyle = paper; c.fillRect(0, 0, CARD_W, CARD_H);

  // fine wave print across the data area
  c.lineWidth = 0.4;
  for (let i = 0; i < 26; i++) {
    const y = HEADER_H + 6 + i * 7.2;
    c.strokeStyle = i % 3 === 0 ? "rgba(154,195,31,0.16)" : "rgba(14,49,51,0.045)";
    c.beginPath(); c.moveTo(0, y);
    for (let x = 0; x < CARD_W; x += 84) c.bezierCurveTo(x + 28, y - 4, x + 56, y + 4, x + 84, y);
    c.stroke();
  }
  c.globalAlpha = 0.6; rosette(c, CARD_W - M - 50, 142, 52); c.globalAlpha = 1;
  if (logo) { c.globalAlpha = 0.05; c.drawImage(logo, CARD_W - M - 72, 120, 44, 44); c.globalAlpha = 1; }

  // ---- header ----
  const hg = c.createLinearGradient(0, 0, CARD_W, 0);
  hg.addColorStop(0, "#0B2A2C"); hg.addColorStop(1, "#14403F");
  c.fillStyle = hg; c.fillRect(0, 0, CARD_W, HEADER_H);
  c.fillStyle = LIME; c.fillRect(0, HEADER_H - 1.5, CARD_W, 1.5);
  if (logo) {
    c.save(); c.beginPath(); c.arc(M + 13, HEADER_H / 2, 13, 0, Math.PI * 2); c.closePath();
    c.fillStyle = "#fff"; c.fill(); c.clip(); c.drawImage(logo, M, HEADER_H / 2 - 13, 26, 26); c.restore();
  }
  c.fillStyle = "#FFFFFF"; c.font = `750 11.5px ${FONT}`;
  tracked(c, "GREEN PEOPLE MOVEMENT", M + 34, 20.5, 0.9);
  c.fillStyle = LIME; c.font = `600 6.2px ${FONT}`;
  tracked(c, "MEMBERSHIP DATA PAGE", M + 34, 31.5, 1.6);
  c.fillStyle = "rgba(255,255,255,0.55)"; c.font = `600 5.6px ${FONT}`;
  tracked(c, "MEMBER NO.", CARD_W - M, 18, 1.2, "right");
  c.fillStyle = "#FFFFFF"; c.font = `700 12px ${MONO}`;
  tracked(c, `GP ${num.slice(0, 4)} ${num.slice(4)}`, CARD_W - M, 31.5, 0.6, "right");

  // ---- portrait ----
  const PX = M, PY = HEADER_H + 14, PW = 92, PH = 136;
  c.save();
  c.shadowColor = "rgba(14,49,51,0.18)"; c.shadowBlur = 8; c.shadowOffsetY = 3;
  rounded(c, PX, PY, PW, PH, 10); c.fillStyle = "#fff"; c.fill();
  c.restore();
  c.save(); rounded(c, PX + 2.5, PY + 2.5, PW - 5, PH - 5, 8); c.clip();
  const pg = c.createLinearGradient(PX, PY, PX + PW, PY + PH);
  pg.addColorStop(0, "#1E5254"); pg.addColorStop(1, "#0B2A2C");
  c.fillStyle = pg; c.fillRect(PX, PY, PW, PH);
  rosette(c, PX + PW / 2, PY + 56, 42);
  c.strokeStyle = "rgba(154,195,31,0.55)"; c.lineWidth = 1;
  c.beginPath(); c.arc(PX + PW / 2, PY + 56, 29, 0, Math.PI * 2); c.stroke();
  c.fillStyle = LIME; c.font = `800 28px ${FONT}`; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(initialsOf(data.fullName), PX + PW / 2, PY + 57);
  c.textBaseline = "alphabetic";
  c.fillStyle = LIME; c.fillRect(PX, PY + PH - 20, PW, 20);
  c.fillStyle = INK; c.font = `800 6.4px ${FONT}`;
  tracked(c, "✓ VERIFIED", PX + PW / 2, PY + PH - 7.5, 1.4, "center");
  c.restore();
  c.textAlign = "left";

  // ---- fields ----
  const GX = PX + PW + 18, GW = CARD_W - M - GX, GAP = 12, COL = (GW - GAP * 5) / 6;
  const field = (label: string, value: string, col: number, span: number, y: number, size = 11) => {
    const x = GX + col * (COL + GAP);
    const w = span * COL + (span - 1) * GAP;
    c.fillStyle = MUTED; c.font = `600 5.6px ${FONT}`;
    tracked(c, label.toUpperCase(), x, y, 1);
    c.fillStyle = INK;
    fit(c, (value || "—").toUpperCase(), x, y + 12.5, w, size, 700);
  };
  const ROW = 30, Y0 = PY + 5.5;
  field("Type", "GPM", 0, 2, Y0);
  field("Code", "NG", 2, 2, Y0);
  field("Sex", gender, 4, 2, Y0);
  field("Surname", surname, 0, 6, Y0 + ROW, 12.5);
  field("Given names", given, 0, 6, Y0 + ROW * 2, 12.5);
  field("State", stateLabel(data.state) || "", 0, 3, Y0 + ROW * 3);
  field("LGA", data.lga || "", 3, 3, Y0 + ROW * 3);
  // status in brand green
  const sy = Y0 + ROW * 4;
  c.fillStyle = MUTED; c.font = `600 5.6px ${FONT}`; tracked(c, "STATUS", GX, sy, 1);
  c.fillStyle = OLIVE; fit(c, "VERIFIED MEMBER", GX, sy + 12.5, 3 * COL + 2 * GAP, 11, 750);
  if (data.issued) field("Date of joining", fmtDate(data.issued), 3, 3, sy);

  // ---- footer line ----
  const FY = CARD_H - MRZ_H - 10;
  c.strokeStyle = "rgba(14,49,51,0.12)"; c.lineWidth = 0.6;
  c.beginPath(); c.moveTo(M, FY - 9); c.lineTo(CARD_W - M, FY - 9); c.stroke();
  c.fillStyle = MUTED; c.font = `600 5.8px ${FONT}`;
  tracked(c, "ONE PEOPLE  ·  ONE GREEN FUTURE", M, FY, 1.3);
  c.fillStyle = INK; c.font = `700 6.4px ${FONT}`;
  tracked(c, "GREENPEOPLE.NG", CARD_W - M, FY, 1.2, "right");

  // ---- machine-readable zone ----
  const MY = CARD_H - MRZ_H;
  c.fillStyle = "rgba(255,255,255,0.86)"; c.fillRect(0, MY, CARD_W, MRZ_H);
  c.fillStyle = "rgba(14,49,51,0.10)"; c.fillRect(0, MY, CARD_W, 0.8);
  c.fillStyle = INK;
  const line1 = mrzLine(`GPM<NG<${mrzClean(surname)}<<${mrzClean(given)}`);
  const line2 = mrzLine(`GP${num}<${mrzClean(stateLabel(data.state))}<${mrzClean(data.lga)}<<VERIFIED<MEMBER`);
  // spread 44 characters evenly across the zone
  c.font = `700 10.4px ${MONO}`;
  const span = CARD_W - M * 2;
  const step = span / 44;
  [line1, line2].forEach((ln, i) => {
    const y = MY + 22 + i * 17;
    [...ln].forEach((ch, j) => { c.textAlign = "center"; c.fillText(ch, M + step * (j + 0.5), y); });
  });
  c.textAlign = "left";
  c.restore();

  // hairline edge
  rounded(c, 0.4, 0.4, CARD_W - 0.8, CARD_H - 0.8, 15.6);
  c.strokeStyle = "rgba(14,49,51,0.18)"; c.lineWidth = 0.8; c.stroke();

  return canvas;
}

export async function drawMemberId(data: MemberIdData): Promise<Blob> {
  const canvas = await drawMemberIdCanvas(data);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create image"))), "image/png"),
  );
}

/** Saves the PNG: share sheet on phones that support it, otherwise a download. */
export async function saveMemberId(data: MemberIdData, fileName: string) {
  const blob = await drawMemberId(data);
  const file = new File([blob], fileName, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], title: "My Green People ID" }); return; }
    catch (e) { if ((e as Error).name === "AbortError") return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
