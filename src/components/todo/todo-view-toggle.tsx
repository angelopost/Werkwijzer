import Link from "next/link";
import { cn } from "@/lib/utils";

export function TodoViewToggle({ basePath, isToday }: { basePath: string; isToday: boolean }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border bg-card p-1">
      <Link
        href={`${basePath}?view=vandaag`}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          isToday
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        Vandaag
      </Link>
      <Link
        href={basePath}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          !isToday
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        Deze week
      </Link>
    </div>
  );
}
