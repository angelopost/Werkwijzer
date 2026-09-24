import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function StylrsAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/stylrs" className="flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="text-xl font-semibold tracking-tight text-foreground">STYLRS</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
