"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Van/Tot-periodefilter met snelkoppelingen voor deze week/maand, gesynchroniseerd
 * met de ?from=&to= query-parameters. Herbruikbaar overal waar je een periode van
 * gepubliceerde diensten wilt kunnen opvragen (Uren, Mijn uren). */
export function PeriodFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const hasFilters = Boolean(from || to);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  function setRange(rangeFrom: string, rangeTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("from", rangeFrom);
    params.set("to", rangeTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  function selectThisWeek() {
    const now = new Date();
    const mondayOffset = (now.getDay() + 6) % 7;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    setRange(toInputDate(monday), toInputDate(sunday));
  }

  function selectThisMonth() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setRange(toInputDate(first), toInputDate(last));
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="periodFrom">Van</Label>
        <Input
          id="periodFrom"
          type="date"
          value={from}
          onChange={(e) => setParam("from", e.target.value)}
          className="h-8 w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="periodTo">Tot en met</Label>
        <Input
          id="periodTo"
          type="date"
          value={to}
          onChange={(e) => setParam("to", e.target.value)}
          className="h-8 w-auto"
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={selectThisWeek}>
        Deze week
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={selectThisMonth}>
        Deze maand
      </Button>
      {hasFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Filters wissen
        </Button>
      )}
    </div>
  );
}
