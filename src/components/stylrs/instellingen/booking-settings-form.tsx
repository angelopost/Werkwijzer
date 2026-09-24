"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { updateBookingSettings, type ActionState } from "@/actions/stylrs/settings";

type BookingSettings = {
  maxAdvanceDays: number;
  minNoticeMinutes: number;
  bufferMinutes: number;
  allowEmployeeSelection: boolean;
  allowNoPreference: boolean;
  allowCustomerCancel: boolean;
  cancelDeadlineHours: number;
  requirePhone: boolean;
  requireEmail: boolean;
};

function ToggleRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{checked ? "AAN" : "UIT"}</span>
        <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
        <input type="hidden" name={name} value={checked ? "on" : ""} />
      </span>
    </label>
  );
}

export function BookingSettingsForm({ settings }: { settings: BookingSettings }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateBookingSettings, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="maxAdvanceDays">Hoeveel dagen vooruit boeken</Label>
          <Input id="maxAdvanceDays" name="maxAdvanceDays" type="number" min="1" defaultValue={settings.maxAdvanceDays} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="minNoticeMinutes">Minimale tijd vooraf (minuten)</Label>
          <Input id="minNoticeMinutes" name="minNoticeMinutes" type="number" min="0" defaultValue={settings.minNoticeMinutes} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bufferMinutes">Buffer tussen afspraken (minuten)</Label>
          <Input id="bufferMinutes" name="bufferMinutes" type="number" min="0" defaultValue={settings.bufferMinutes} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cancelDeadlineHours">Annuleren mag tot (uur vooraf)</Label>
          <Input id="cancelDeadlineHours" name="cancelDeadlineHours" type="number" min="0" defaultValue={settings.cancelDeadlineHours} />
        </div>
      </div>

      <div className="border-t pt-2">
        <ToggleRow name="allowEmployeeSelection" label="Klant mag zelf een medewerker kiezen" defaultChecked={settings.allowEmployeeSelection} />
        <ToggleRow name="allowNoPreference" label="Klant mag kiezen voor 'Geen voorkeur'" defaultChecked={settings.allowNoPreference} />
        <ToggleRow name="allowCustomerCancel" label="Klant mag zelf annuleren" defaultChecked={settings.allowCustomerCancel} />
        <ToggleRow name="requirePhone" label="Telefoonnummer verplicht bij boeken" defaultChecked={settings.requirePhone} />
        <ToggleRow name="requireEmail" label="E-mailadres verplicht bij boeken" defaultChecked={settings.requireEmail} />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-end">
        {pending ? "Bezig…" : "Opslaan"}
      </Button>
    </form>
  );
}
