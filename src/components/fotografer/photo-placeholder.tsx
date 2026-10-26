import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";
import { FileImage } from "@/components/ui/file-image";

const TONES: Record<string, string> = {
  butter: "from-butter via-butter/60 to-butter-deep/70",
  sky: "from-sky via-sky/60 to-sky-deep/70",
  sage: "from-sage via-sage/60 to-sage-deep/70",
};

export function PhotoPlaceholder({
  tone = "sage",
  label,
  fileKey,
  alt,
  className,
}: {
  tone?: string;
  label?: string;
  fileKey?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        TONES[tone] ?? TONES.sage,
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(81,50,41,0.55) 0, rgba(81,50,41,0.55) 1px, transparent 1px, transparent 15px)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-paper/45 blur-2xl"
        aria-hidden="true"
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-ink/25">
        <Icon name="camera" size={30} />
      </span>
      {fileKey ? (
        <FileImage fileKey={fileKey} alt={alt ?? label ?? "Foto portofolio"} />
      ) : null}
      {label ? (
        <span className="absolute bottom-2.5 left-3.5 right-3.5 truncate font-serif text-sm text-ink/85">
          {label}
        </span>
      ) : null}
    </div>
  );
}
