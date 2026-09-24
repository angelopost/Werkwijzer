"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink } from "lucide-react";

export function BookingLinkCard({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/book/${slug}`;
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard kan geblokkeerd zijn; negeren
    }
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="mb-1 text-sm font-medium text-foreground">Jouw boekingslink</p>
      <p className="mb-3 text-sm text-muted-foreground">
        Deel deze link op je website, Instagram, Google Bedrijfsprofiel of WhatsApp zodat klanten
        rechtstreeks kunnen boeken.
      </p>
      <div className="flex gap-2">
        <Input readOnly value={url} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="icon" onClick={handleCopy} aria-label="Kopiëren">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          nativeButton={false}
          render={
            <a href={path} target="_blank" rel="noreferrer" aria-label="Openen">
              <ExternalLink className="size-4" />
            </a>
          }
        />
      </div>
    </div>
  );
}
