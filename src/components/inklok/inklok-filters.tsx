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

export function InklokFilters({ staff }: { staff: { id: string; name: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const date = searchParams.get("date") ?? "";
  const userId = searchParams.get("userId") ?? "";
  const hasFilters = Boolean(date || userId);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filterDate">Dag</Label>
        <Input
          id="filterDate"
          type="date"
          value={date}
          onChange={(e) => setParam("date", e.target.value)}
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
      {hasFilters && (
        <Button type="button" variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Filters wissen
        </Button>
      )}
    </div>
  );
}
