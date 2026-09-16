"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function InviteLinkBanner({ path, onDismiss }: { path: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable; user can still select the text manually
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-accent/40 px-4 py-3 text-sm">
      <div className="flex flex-col gap-1">
        <p className="font-medium">Uitnodigingslink klaar — deel deze met de medewerker</p>
        <code className="break-all text-muted-foreground">{url}</code>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy}>
          {copied ? "Gekopieerd!" : "Kopiëren"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Sluiten
        </Button>
      </div>
    </div>
  );
}
