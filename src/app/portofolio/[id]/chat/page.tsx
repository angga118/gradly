import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { ChatWithPhotographer } from "@/components/public/chat-with-photographer";

export const metadata: Metadata = {
  title: "Chat dengan fotografer",
  description: "Tanya langsung ke fotografer sebelum memesan paket.",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PublicShell>
      <ChatWithPhotographer photographerId={id} />
    </PublicShell>
  );
}
