"use client";

import { useState } from "react";
import { useGradly } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/field";
import { Avatar } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageHeader } from "./page-header";
import { Reveal } from "./reveal";

export function ChatWithPhotographer({ photographerId }: { photographerId: string }) {
  const { session, userById } = useGradly();
  const fotografer = userById(photographerId);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (!fotografer) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16">
        <Card className="p-6 text-center">
          <p className="text-sm text-ink/70">Fotografer tidak ditemukan.</p>
          <Button href="/portofolio" className="mt-4" variant="secondary">
            Kembali ke portofolio
          </Button>
        </Card>
      </div>
    );
  }

  function handleSend() {
    if (!message.trim()) return;
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16">
      <Reveal>
        <PageHeader
          eyebrow="Chat"
          title={"Tanya ke " + fotografer.name}
          description="Kirim pertanyaanmu langsung ke fotografer. Mereka akan membalas melalui notifikasi atau kontak yang terdaftar."
        />
      </Reveal>

      <Reveal delay={70}>
        <Card className="mt-8 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-ink/10 px-6 py-4">
            <Avatar name={fotografer.name} size={48} />
            <div>
              <p className="font-medium">{fotografer.name}</p>
              <p className="text-sm text-ink/60">{fotografer.studio || "Fotografer"}   {fotografer.city}</p>
            </div>
          </div>

          <div className="px-6 py-6">
            {!sent ? (
              <div className="space-y-4">
                {!session ? (
                  <div className="rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm text-ink/70">
                    Kamu perlu masuk terlebih dahulu untuk mengirim pesan ke fotografer.
                  </div>
                ) : null}
                <Field label="Pesan kamu" htmlFor="chat-message">
                  <Textarea
                    id="chat-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tanya tentang paket, ketersediaan tanggal, atau hal lain..."
                    rows={6}
                  />
                </Field>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-ink/50">Pesan akan dikirim ke fotografer terkait.</p>
                  <Button onClick={handleSend} disabled={!session || !message.trim()}>
                    <Icon name="send" size={16} />
                    Kirim pesan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/70">
                  <Icon name="check" size={20} />
                </div>
                <h3 className="mt-4 text-lg font-medium">Pesan terkirim</h3>
                <p className="mt-2 text-sm text-ink/70">
                  Pesan kamu sudah terkirim ke {fotografer.name}. Fotografer akan membalas melalui notifikasi atau menghubungi kamu.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button href={"/portofolio/" + photographerId} variant="secondary">
                    Kembali ke profil
                  </Button>
                  <Button href="/portofolio">Lihat fotografer lain</Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
