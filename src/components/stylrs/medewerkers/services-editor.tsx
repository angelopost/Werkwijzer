"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { setEmployeeServices } from "@/actions/stylrs/employees";

type Service = { id: string; name: string; category: string | null };

export function ServicesEditor({
  employeeId,
  services,
  selectedIds,
}: {
  employeeId: string;
  services: Service[];
  selectedIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [isPending, startTransition] = useTransition();

  function toggle(serviceId: string, checked: boolean) {
    const next = checked ? [...selected, serviceId] : selected.filter((id) => id !== serviceId);
    setSelected(next);
    const formData = new FormData();
    next.forEach((id) => formData.append("serviceId", id));
    startTransition(() => {
      setEmployeeServices(employeeId, formData);
    });
  }

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Voeg eerst behandelingen toe bij <span className="font-medium">Behandelingen</span> om ze hier te
        kunnen koppelen.
      </p>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {services.map((service) => (
        <label
          key={service.id}
          className="flex items-center gap-2.5 rounded-lg border p-3 text-sm has-data-checked:border-primary"
        >
          <Checkbox
            checked={selected.includes(service.id)}
            onCheckedChange={(checked) => toggle(service.id, checked === true)}
          />
          <span>
            {service.name}
            {service.category && <span className="ml-1.5 text-xs text-muted-foreground">({service.category})</span>}
          </span>
        </label>
      ))}
      {isPending && <p className="text-xs text-muted-foreground sm:col-span-2">Bezig met opslaan…</p>}
    </div>
  );
}
