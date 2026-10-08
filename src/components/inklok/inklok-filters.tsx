"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** weekStart = maandag (YYYY-MM-DD) van de getoonde week, of null als er geen weekfilter actief is
 * (alle weken, of een eigen periode via Van/Tot). */
export function InklokFilters({
  staff,
  weekStart,
  weekLabel,
  prevWeek,
  nextWeek,
  thisWeek,
}: {
  staff: { id: string; name: string }[];
  weekStart: string | null;
  weekLabel: string;
  prevWeek: string;
  nextWeek: string;
  thisWeek: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const hasFilters = Boolean(from || to || userId || searchParams.get("week"));
  const allWeeks = searchParams.get("week") === "alle";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key === "from" || key === "to") params.delete("week");
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  function setRange(rangeFrom: string, rangeTo: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("week");
    params.set("from", rangeFrom);
    params.set("to", rangeTo);
    router.push(`${pathname}?${params.toString()}`);
  }

  function selectThisMonth() {
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setRange(toInputDate(first), toInputDate(last));
  }

  /** Kiest een week (of "alle"); een eventuele eigen periode (Van/Tot) vervalt dan. */
  function setWeek(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    params.set("week", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <Label>Week</Label>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-8 items-center gap-1 rounded-lg border bg-background px-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Vorige week"
              onClick={() => setWeek(weekStart ? prevWeek : thisWeek)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="flex min-w-36 items-center justify-center gap-1.5 px-1 text-sm font-medium whitespace-nowrap">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              {weekStart ? weekLabel : allWeeks ? "Alle weken" : "Eigen periode"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Volgende week"
              onClick={() => setWeek(weekStart ? nextWeek : thisWeek)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant={weekStart === thisWeek ? "secondary" : "outline"}
            size="sm"
            onClick={() => setWeek(thisWeek)}
          >
            Deze week
          </Button>
          <Button
            type="button"
            variant={allWeeks ? "secondary" : "outline"}
            size="sm"
            onClick={() => setWeek("alle")}
          >
            Alle weken
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filterFrom">Van</Label>
        <Input
          id="filterFrom"
          type="date"
          value={from}
          onChange={(e) => setParam("from", e.target.value)}
          className="h-8 w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filterTo">Tot en met</Label>
        <Input
          id="filterTo"
          type="date"
          value={to}
          onChange={(e) => setParam("to", e.target.value)}
          className="h-8 w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filterStaff">Medewerker</Label>
        <Select
          value={userId || "all"}
          onValueChange={(value) => setParam("userId", value === "all" ? "" : (value ?? ""))}
        >
          <SelectTrigger id="filterStaff" size="sm" className="h-8 w-48">
            <SelectValue placeholder="Alle medewerkers">
              {() => staff.find((s) => s.id === userId)?.name ?? "Alle medewerkers"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle medewerkers</SelectItem>
            {staff.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
