import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  VAST: "Vast contract",
  NUL_UREN: "Nul uren contract",
};

export function ContractTypeBadge({
  contractType,
  className,
}: {
  contractType: "VAST" | "NUL_UREN" | null;
  className?: string;
}) {
  if (!contractType) return null;

  return (
    <Badge
      className={cn(
        "font-medium",
        contractType === "VAST" && "bg-primary text-primary-foreground",
        contractType === "NUL_UREN" && "bg-accent text-accent-foreground",
        className
      )}
    >
      {LABELS[contractType]}
    </Badge>
  );
}
