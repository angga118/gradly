"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icons";

export function PasswordInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-12", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={visible}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
      >
        <Icon name={visible ? "eyeOff" : "eye"} size={18} />
      </button>
    </div>
  );
}
