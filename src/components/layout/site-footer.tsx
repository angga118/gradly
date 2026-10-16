import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const columns = [
  {
    title: "Jelajahi",
    links: [
      { href: "/paket", label: "Paket" },
      { href: "/portofolio", label: "Portofolio" },
      { href: "/subsidi", label: "Program subsidi" },
      { href: "/bantuan", label: "Bantuan & FAQ" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/masuk", label: "Masuk" },
      { href: "/daftar", label: "Daftar" },
      { href: "/riwayat", label: "Riwayat booking" },
      { href: "/profil", label: "Profil" },
    ],
  },
  {
    title: "Portal",
    links: [
      { href: "/fotografer", label: "Portal Fotografer" },
      { href: "/admin", label: "Panel Admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-sage/40">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink/65">
            Jasa foto wisuda dengan program subsidi untuk pemegang SKTM dan
            penerima KIP-K. Hangat, jujur, dan terjangkau.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink/65 transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-6 text-xs text-ink/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 Gradly. Semua hak dilindungi.</p>
          <p>Dibuat di Bandung · Sesuai UU PDP</p>
        </div>
      </div>
    </footer>
  );
}
