import { useEffect, useState } from "react";
import { drawMemberIdCanvas } from "@/lib/drawMemberId";
import { CARD_W, CARD_H, type MemberIdData } from "@/components/MemberIdCard";

/** Shows the membership ID exactly as it downloads (same drawing). */
export const ScaledMemberIdCard = ({ data }: { data: MemberIdData }) => {
  const [src, setSrc] = useState<string | null>(null);
  const key = JSON.stringify({ ...data, issued: data.issued?.toISOString() ?? null });
  useEffect(() => {
    let alive = true;
    drawMemberIdCanvas(data).then((cv) => { if (alive) setSrc(cv.toDataURL("image/png")); }).catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <div className="w-full mx-auto" style={{ maxWidth: CARD_W * 1.25, aspectRatio: `${CARD_W} / ${CARD_H}` }}>
      {src ? (
        <img src={src} alt={`Green People membership ID for ${data.fullName}`}
          className="w-full h-full rounded-2xl shadow-[0_18px_40px_-18px_rgba(14,49,51,0.55)] animate-in fade-in zoom-in-95 duration-500" />
      ) : (
        <div className="w-full h-full rounded-2xl bg-pale/60 animate-pulse" aria-label="Preparing your ID" />
      )}
    </div>
  );
};
