import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  href = "/",
  tone = "ink",
}: {
  className?: string;
  href?: string | null;
  tone?: "ink" | "paper";
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          tone === "ink" ? "bg-ink text-paper" : "bg-paper text-ink",
        )}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M22 10 12 5 2 10l10 5 10-5Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight">Gradly</span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex" aria-label="Gradly, ke beranda">
      {content}
    </Link>
  );
}
