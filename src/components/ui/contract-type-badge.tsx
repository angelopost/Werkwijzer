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
    <span
      className={cn(
        "inline-flex w-fit items-center rounded px-1.5 py-px text-[10px] leading-4 font-medium whitespace-nowrap",
        contractType === "VAST" && "bg-primary/10 text-primary",
        contractType === "NUL_UREN" && "bg-muted text-muted-foreground",
        className
      )}
    >
      {LABELS[contractType]}
    </span>
  );
}
