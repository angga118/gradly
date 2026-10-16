export type MailInput = { to: string; subject: string; text: string; html?: string }

export async function sendMail(input: MailInput): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM

  if (!apiKey || !from) {
    // honey: fire-and-forget, no retry/queue; revisit if delivery matters
    console.log(`[mail] skipped (no RESEND_API_KEY): ${input.subject} → ${input.to}`)
    return { ok: true, skipped: true }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error")
      return { ok: false, error: errorText }
    }

    return { ok: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { ok: false, error: errorMessage }
  }
}
