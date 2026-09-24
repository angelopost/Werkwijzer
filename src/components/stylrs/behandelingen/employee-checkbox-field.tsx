"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

/// Checkboxen van base-ui geven `name`/`value` niet altijd door aan het interne
/// verborgen native input, dus we houden de checked-status zelf bij en voegen
/// alleen bij aangevinkte items een hidden input toe voor de FormData.
export function EmployeeCheckboxField({
  employeeId,
  label,
  defaultChecked,
}: {
  employeeId: string;
  label: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
      {checked && <input type="hidden" name="employeeId" value={employeeId} />}
      {label}
    </label>
  );
}
