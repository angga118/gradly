import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Kemunculan halus saat mount (lebih pendek/cepat dari versi public).
 * Animasi murni CSS (kelas `.reveal` di globals.css) sehingga konten tetap
 * terlihat tanpa JS. Hormati prefers-reduced-motion lewat globals.css.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const style = {
    "--reveal-duration": "500ms",
    "--reveal-shift": "0.75rem",
    ...(delay > 0 ? { "--reveal-delay": `${delay}ms` } : null),
  } as CSSProperties;

  return (
    <div className={cn("reveal", className)} style={style}>
      {children}
    </div>
  );
}
