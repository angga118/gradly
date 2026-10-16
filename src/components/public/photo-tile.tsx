import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";

type Tone = "butter" | "sky" | "sage" | "ink";

const TONES: Record<Tone, string> = {
  butter: "from-butter via-butter/70 to-butter-deep/85",
  sky: "from-sky via-sky/70 to-sky-deep/85",
  sage: "from-sage via-sage/70 to-sage-deep/85",
  ink: "from-ink-soft via-ink to-ink",
};

/**
 * Placeholder foto tanpa gambar asli: gradasi palet + pola garis diagonal
 * dan satu blob lembut supaya terasa seperti cetakan foto, bukan kotak kosong.
 */
export function PhotoTile({
  tone = "sage",
  label,
  meta,
  className,
  children,
}: {
  tone?: Tone;
  label?: string;
  meta?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        TONES[tone],
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(81,50,41,0.6) 0, rgba(81,50,41,0.6) 1px, transparent 1px, transparent 16px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-paper/50 blur-2xl"
        aria-hidden="true"
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink/20">
        <Icon name="camera" size={30} />
      </span>
      {label ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/45 to-transparent p-4 pt-10">
          <p className="truncate font-serif text-base leading-tight text-paper">
            {label}
          </p>
          {meta ? (
            <p className="mt-0.5 truncate text-xs text-paper/75">{meta}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
