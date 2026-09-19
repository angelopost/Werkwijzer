"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

/** Van/Tot-periodefilter met medewerker-dropdown voor de Uren-pagina, gesynchroniseerd
 * met de ?from=&to=&userId= query-parameters. */
export function UrenFilters({ staff }: { staff: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const hasFilters = Boolean(from || to || userId);

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
        <Label htmlFor="urenFrom">Van</Label>
        <Input
          id="urenFrom"
          type="date"
          value={from}
          onChange={(e) => setParam("from", e.target.value)}
          className="h-8 w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="urenTo">Tot en met</Label>
        <Input
          id="urenTo"
          type="date"
          value={to}
          onChange={(e) => setParam("to", e.target.value)}
          className="h-8 w-auto"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="urenStaff">Medewerker</Label>
        <Select
          value={userId || "all"}
          onValueChange={(value) => setParam("userId", value === "all" ? "" : (value ?? ""))}
        >
          <SelectTrigger id="urenStaff" size="sm" className="h-8 w-48">
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
