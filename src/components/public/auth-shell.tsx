import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";

const BENEFITS = [
  "Pesan sesi foto wisuda dalam beberapa menit",
  "Harga transparan, tanpa biaya tersembunyi",
  "Program subsidi SKTM & KIP-K hingga 60%",
  "Bukti transfer dan status booking terlacak",
];

/**
 * Kerangka halaman autentikasi: panel editorial gelap di kiri (desktop)
 * dan slot form di kanan.
 */
export function AuthShell({
  children,
  quote,
}: {
  children: ReactNode;
  quote?: { text: string; name: string };
}) {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-16">
      <aside className="relative hidden overflow-hidden rounded-[2rem] bg-ink p-10 text-paper lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(55% 45% at 12% 8%, rgba(252,230,183,0.45) 0, transparent 60%), radial-gradient(50% 50% at 92% 92%, rgba(216,235,249,0.4) 0, transparent 60%)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <Logo tone="paper" />
          <h2 className="mt-12 max-w-sm font-serif text-3xl leading-tight text-paper">
            Momen kelulusan yang hangat, untuk semua.
          </h2>
          <ul className="mt-8 space-y-3.5">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-paper/80">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-butter text-ink">
                  <Icon name="check" size={12} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {quote ? (
          <div className="relative mt-12 rounded-[1.5rem] border border-paper/15 bg-paper/5 p-6">
            <Icon name="quote" size={24} className="text-paper/30" />
            <p className="mt-3 text-sm leading-relaxed text-paper/85">{quote.text}</p>
            <p className="mt-3 text-xs text-paper/55">— {quote.name}</p>
          </div>
        ) : null}
      </aside>

      <div className="mx-auto flex w-full max-w-md flex-col justify-center">{children}</div>
    </div>
  );
}
