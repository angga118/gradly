import { Suspense } from "react";
import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { ChatWithPhotographer } from "@/components/public/chat-with-photographer";

// Sama seperti halaman induk: `params` adalah data runtime, jadi izinkan render blocking.
export const instant = false;

export const metadata: Metadata = {
  title: "Chat dengan fotografer",
  description: "Tanya langsung ke fotografer sebelum memesan paket.",
};

async function ChatContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatWithPhotographer photographerId={id} />;
}

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <PublicShell>
      <Suspense fallback={null}>
        <ChatContent params={params} />
      </Suspense>
    </PublicShell>
  );
}
