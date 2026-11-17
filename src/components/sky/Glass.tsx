import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & { as?: "div" | "section" | "article" | "aside" };
/** Frosted glass surface primitive — use for cards, panels, forms. */
const Glass = forwardRef<HTMLDivElement, Props>(({ as: Tag = "div", className, ...rest }, ref) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Tag ref={ref as any} className={cn("glass", className)} {...rest} />
));
Glass.displayName = "Glass";
export default Glass;
