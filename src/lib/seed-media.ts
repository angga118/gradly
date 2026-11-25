import type { PortfolioItem } from "./types";

/** Sampul galeri per fotografer: pakai data nyata bila ada, aset seed bila tidak. */
const COVERS: Record<string, string> = {
  p1: "seed/foto-01.svg",
  p2: "seed/foto-07.svg",
  p3: "seed/foto-10.svg",
  p4: "seed/foto-13.svg",
};

export function coverForPhotographer(
  items: PortfolioItem[],
  photographerId: string,
): string {
  return (
    items.find((item) => item.photographerId === photographerId && item.key)?.key ??
    COVERS[photographerId] ??
    items.find((item) => item.key)?.key ??
    "seed/foto-01.svg"
  );
}

/** Foto klien dicocokkan dari nama depan yang tersedia di data portofolio. */
export function coverForClient(items: PortfolioItem[], clientName: string): string {
  const first = clientName.trim().split(/\s+/)[0]?.toLowerCase();
  return (
    items.find(
      (item) =>
        first && item.key && item.clientName.toLowerCase().startsWith(first),
    )?.key ??
    items.find((item) => item.key)?.key ??
    "seed/foto-01.svg"
  );
}
