"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { EMPLOYEE_COLORS } from "@/lib/stylrs/constants";

export function EmployeeColorPicker({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? EMPLOYEE_COLORS[0]);

  return (
    <div className="flex flex-wrap gap-2">
      <input type="hidden" name={name} value={value} />
      {EMPLOYEE_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`Kies kleur ${color}`}
          onClick={() => setValue(color)}
          className={cn(
            "size-7 rounded-full ring-offset-2 ring-offset-background transition-transform",
            value === color ? "ring-2 ring-foreground scale-105" : "hover:scale-105"
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
