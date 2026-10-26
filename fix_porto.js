const fs = require("fs");
const fixed = `"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useGradly } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { FileImage } from "@/components/ui/file-image";
import { Avatar, EmptyState, Rating } from "@/components/ui/misc";
import { PageHeader } from "./page-header";
import { Reveal } from "./reveal";

export function PortofolioView() {
  const { users, portfolio, hydrated } = useGradly();
  const fotografer = users.filter((u) => u.role === "fotografer");

  const coverByPhotographer = useMemo(() => {
    const map = new Map();
    for (const item of portfolio) {
      if (item.key && !map.has(item.photographerId)) {
        map.set(item.photographerId, item.key);
      }
    }
    return map;
  }, [portfolio]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      <Reveal>
        <PageHeader
          eyebrow="Portofolio"
          title="Temukan fotografermu"
          description="Jelajahi semua fotografer Gradly: bandingkan studio, rating, gaya, dan ketersediaannya sebelum memilih satu untuk sesimu."
        />
      </Reveal>

      {!hydrated ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          <span className="sr-only">Memuat daftar fotografer…</span>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-[var(--radius-card)] bg-ink/5" />
          ))}
        </div>
      ) : fotografer.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon="camera"
            title="Belum ada fotografer"
            description="Fotografer yang sudah bergabung dengan Gradly akan muncul di sini."
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fotografer.map((f, i) => {
            const cover = coverByPhotographer.get(f.id);
            return (
              <Reveal key={f.id} delay={i * 70} className="h-full">
                <Link
                  href={"/portofolio/" + f.id}
                  className="block h-full"
                  aria-label={"Lihat portofolio " + f.name}
                >
                  <Card className="group h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
                    <div className="relative h-14 bg-gradient-to-br from-sage via-sage/60 to-sky/70">
                      <div
                        className="absolute inset-0 opacity-[0.14]"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(135deg, rgba(81,50,41,0.6) 0, rgba(81,50,41,0.6) 1px, transparent 1px, transparent 16px)",
                        }}
                        aria-hidden="true"
                      />
                      {cover ? (
                        <FileImage
                          fileKey={cover}
                          alt={"Karya terbaru " + f.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex h-full flex-col px-6 pb-6">
                      <div className="-mt-8 flex items-end gap-3">
                        <span className="rounded-full border-4 border-paper">
                          <Avatar name={f.name} size={62} />
                        </span>
                        <div className="min-w-0 pb-1">
                          <h2 className="truncate font-serif text-xl leading-tight">{f.name}</h2>
                          <p className="truncate text-sm text-ink/60">
                            {f.studio || "Fotografer"} · {f.city}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <Rating value={f.rating ?? 0} count={f.sessions ?? 0} />
                        {f.acceptingBookings ? (
                          <Chip tone="sky">Menerima booking</Chip>
                        ) : (
                          <Chip tone="outline">Jadwal penuh</Chip>
                        )}
                      </div>

                      {f.tags && f.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {f.tags.map((tag) => (
                            <Chip key={tag} tone="outline">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-auto flex items-center gap-1.5 border-t border-ink/10 pt-4 text-sm font-medium text-ink/60 transition-colors group-hover:text-ink">
                        Lihat portofolio
                        <Icon name="arrowRight" size={15} />
                      </p>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync("src/components/public/portofolio-view.tsx", fixed);
console.log("done");
