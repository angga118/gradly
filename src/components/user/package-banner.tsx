import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";

type Tone = "sky" | "butter" | "sage";

const tones: Record<Tone, string> = {
  sky: "from-sky via-sky-deep to-paper",
  butter: "from-butter via-butter-deep to-paper",
  sage: "from-sage via-sage-deep to-paper",
};

/** Placeholder foto paket: gradasi palet + pola lembut, tanpa gambar asli. */
export function PackageBanner({
  name,
  tone = "sky",
  className,
  ratio = "aspect-[16/9]",
}: {
  name: string;
  tone?: Tone;
  className?: string;
  ratio?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        tones[tone],
        ratio,
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(81,50,41,0.55) 0, transparent 42%), radial-gradient(circle at 82% 68%, rgba(81,50,41,0.4) 0, transparent 38%), radial-gradient(circle at 55% 40%, rgba(255,255,255,0.5) 0, transparent 45%)",
        }}
      />
      <div className="absolute bottom-3 left-4 flex items-center gap-2 text-ink/70">
        <Icon name="camera" size={16} />
        <span className="text-xs font-medium uppercase tracking-[0.16em]">{name}</span>
      </div>
    </div>
  );
}
