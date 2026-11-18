import greenLogo from "@/assets/green-logo.png";
import {
  CARD_W, CARD_H, DEEP, LIME, PAPER, type MemberIdData,
  splitName, initialsOf, mrzClean, mrzLine, fmtDate, stateLabel,
} from "@/components/MemberIdCard";

/**
 * Draws the membership ID straight onto a canvas. iPhone browsers block the
 * old "screenshot the page" approach, so this paints every line itself and
 * always produces a clean PNG.
 */
const SCALE = 3;
const FONT = "'Inter Tight', 'Inter', system-ui, -apple-system, sans-serif";
const MONO = "'Courier New', ui-monospace, monospace";

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

/** Writes text, shrinking it until it fits `maxW`. */
const fit = (c: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, size: number, weight = 700, family = FONT, min = 7) => {
  let s = size;
  c.font = `${weight} ${s}px ${family}`;
  while (c.measureText(text).width > maxW && s > min) { s -= 0.5; c.font = `${weight} ${s}px ${family}`; }
  c.fillText(text, x, y);
};

export async function drawMemberId(data: MemberIdData): Promise<Blob> {
  try { await document.fonts?.ready; } catch { /* ignore */ }
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const c = canvas.getContext("2d")!;
  c.scale(SCALE, SCALE);
  c.textBaseline = "alphabetic";

  const { surname, given } = splitName(data);
  const num = String(data.memberNumber || 0).padStart(8, "0");
  const gender = data.gender ? data.gender.charAt(0).toUpperCase() : "";
  const logo = await loadImage(greenLogo);

  // paper
  rounded(c, 0, 0, CARD_W, CARD_H, 14);
  c.save(); c.clip();
  c.fillStyle = PAPER; c.fillRect(0, 0, CARD_W, CARD_H);

  // guilloche security lines
  c.lineWidth = 0.7;
  for (let i = 0; i < 40; i++) {
    const y = 4 + i * 8;
    c.strokeStyle = i % 2 ? "rgba(154,195,31,0.22)" : "rgba(14,49,51,0.07)";
    c.beginPath(); c.moveTo(0, y);
    for (let x = 0; x < CARD_W; x += 105) {
      c.bezierCurveTo(x + 35, y - 7, x + 70, y + 7, x + 105, y);
    }
    c.stroke();
  }

  // watermark
  if (logo) { c.globalAlpha = 0.07; c.drawImage(logo, 248, 70, 150, 150); c.globalAlpha = 1; }

  // security stripe
  const stripe = c.createLinearGradient(0, 0, 0, CARD_H);
  stripe.addColorStop(0, LIME); stripe.addColorStop(1, "#5E8A12");
  c.fillStyle = stripe; c.fillRect(0, 0, 6, CARD_H);

  // header band
  c.fillStyle = DEEP; c.fillRect(6, 0, CARD_W - 6, 44);
  if (logo) {
    c.save(); c.beginPath(); c.arc(34, 22, 14, 0, Math.PI * 2); c.closePath();
    c.fillStyle = "#fff"; c.fill(); c.clip(); c.drawImage(logo, 20, 8, 28, 28); c.restore();
  }
  c.fillStyle = "#fff"; c.font = `800 12.5px ${FONT}`; c.fillText("GREEN PEOPLE MOVEMENT", 58, 21);
  c.fillStyle = LIME; c.font = `500 7px ${FONT}`;
  c.fillText("M E M B E R S H I P   D A T A   P A G E", 58, 32);
  c.textAlign = "right";
  c.fillStyle = "rgba(255,255,255,0.6)"; c.font = `500 6px ${FONT}`; c.fillText("MEMBER NO.", CARD_W - 14, 17);
  c.fillStyle = "#fff"; c.font = `800 12px ${MONO}`; c.fillText(`GP-${num}`, CARD_W - 14, 32);
  c.textAlign = "left";

  // portrait
  rounded(c, 18, 54, 96, 122, 9); c.fillStyle = "#fff"; c.fill();
  c.save(); rounded(c, 20, 56, 92, 118, 8); c.clip();
  const pg = c.createLinearGradient(20, 56, 112, 174);
  pg.addColorStop(0, "#1B4A4C"); pg.addColorStop(1, DEEP);
  c.fillStyle = pg; c.fillRect(20, 56, 92, 118);
  c.fillStyle = LIME; c.font = `800 38px ${FONT}`; c.textAlign = "center";
  c.fillText(initialsOf(data.fullName), 66, 120);
  c.fillRect(20, 162, 92, 12);
  c.fillStyle = DEEP; c.font = `800 6.5px ${FONT}`; c.fillText("V E R I F I E D", 66, 170.5);
  c.restore();
  c.textAlign = "center";
  c.fillStyle = "#4E6B57"; c.font = `500 6.5px ${FONT}`; c.fillText("GREENPEOPLE.NG", 66, 188);
  c.textAlign = "left";

  // fields on a 6-column grid
  const gx = 126, gw = CARD_W - 16 - gx, gap = 10, col = (gw - gap * 5) / 6;
  const field = (label: string, value: string, colStart: number, span: number, y: number) => {
    const x = gx + colStart * (col + gap);
    const w = span * col + (span - 1) * gap;
    c.fillStyle = "#4E6B57"; c.font = `500 6.5px ${FONT}`; c.fillText(label.toUpperCase(), x, y);
    c.fillStyle = DEEP; fit(c, (value || "—").toUpperCase(), x, y + 13, w, 11.5);
  };
  field("Type", "GPM", 0, 2, 62);
  field("Code", "NG", 2, 2, 62);
  field("Gender", gender, 4, 2, 62);
  field("Surname", surname, 0, 6, 91);
  field("Given names", given, 0, 6, 120);
  field("State", stateLabel(data.state) || "", 0, 3, 149);
  field("LGA", data.lga || "", 3, 3, 149);
  field("Status", "Verified member", 0, data.issued ? 3 : 6, 178);
  if (data.issued) field("Date of joining", fmtDate(data.issued), 3, 3, 178);

  // machine-readable-style zone
  c.fillStyle = "rgba(255,255,255,0.8)"; c.fillRect(6, CARD_H - 58, CARD_W - 6, 58);
  c.fillStyle = "rgba(14,49,51,0.12)"; c.fillRect(6, CARD_H - 58, CARD_W - 6, 1);
  c.fillStyle = DEEP;
  const line1 = mrzLine(`GPM<NG<${mrzClean(surname)}<<${mrzClean(given)}`);
  const line2 = mrzLine(`GP${num}<${mrzClean(stateLabel(data.state))}<${mrzClean(data.lga)}<<VERIFIED<MEMBER`);
  fit(c, line1, 20, CARD_H - 35, CARD_W - 34, 11.2, 700, MONO);
  fit(c, line2, 20, CARD_H - 16, CARD_W - 34, 11.2, 700, MONO);
  c.restore();

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
