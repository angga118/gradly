import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Kemunculan halus saat mount, dipakai untuk orkestrasi masuk halaman.
 * Animasi murni CSS (kelas `.reveal` di globals.css) sehingga konten tetap
 * terlihat tanpa JS. `prefers-reduced-motion` ditangani lewat globals.css.
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
  return (
    <div
      className={cn("reveal", className)}
      style={
        delay > 0 ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
