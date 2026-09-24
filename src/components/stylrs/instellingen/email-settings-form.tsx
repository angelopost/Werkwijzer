"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateEmailSettings, type ActionState } from "@/actions/stylrs/settings";

type EmailSettings = {
  confirmationEnabled: boolean;
  reminderEnabled: boolean;
  reminderHoursBefore: number;
  rescheduledEnabled: boolean;
  cancelledEnabled: boolean;
  reviewRequestEnabled: boolean;
};

function ToggleRow({
  name,
  label,
  defaultChecked,
  disabled,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  disabled?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{checked ? "AAN" : "UIT"}</span>
        <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} disabled={disabled} />
        <input type="hidden" name={name} value={checked ? "on" : ""} />
      </span>
    </label>
  );
}

export function EmailSettingsForm({ settings }: { settings: EmailSettings }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateEmailSettings, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
      <ToggleRow name="confirmationEnabled" label="Afspraakbevestiging" defaultChecked={settings.confirmationEnabled} />
      <ToggleRow name="reminderEnabled" label="Herinnering vooraf" defaultChecked={settings.reminderEnabled} />
      <div className="flex flex-col gap-2 border-b py-2">
        <Label htmlFor="reminderHoursBefore" className="text-sm">
          Herinnering hoeveel uur vooraf
        </Label>
        <Input
          id="reminderHoursBefore"
          name="reminderHoursBefore"
          type="number"
          min="1"
          max="168"
          defaultValue={settings.reminderHoursBefore}
          className="w-24"
        />
      </div>
      <ToggleRow name="rescheduledEnabled" label="Afspraak gewijzigd" defaultChecked={settings.rescheduledEnabled} />
      <ToggleRow name="cancelledEnabled" label="Afspraak geannuleerd" defaultChecked={settings.cancelledEnabled} />
      <ToggleRow
        name="reviewRequestEnabled"
        label="Reviewverzoek na afspraak (binnenkort beschikbaar)"
        defaultChecked={settings.reviewRequestEnabled}
        disabled
      />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-2 self-end">
        {pending ? "Bezig…" : "Opslaan"}
      </Button>
    </form>
  );
}
