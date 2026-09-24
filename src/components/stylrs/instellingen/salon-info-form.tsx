"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSalonInfo, type ActionState } from "@/actions/stylrs/settings";

type Salon = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  website: string | null;
  logoUrl: string | null;
};

export function SalonInfoForm({ salon }: { salon: Salon }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateSalonInfo, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Salonnaam</Label>
        <Input id="name" name="name" defaultValue={salon.name} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="logoUrl">Logo (URL)</Label>
        <Input id="logoUrl" name="logoUrl" defaultValue={salon.logoUrl ?? ""} placeholder="https://…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">E-mailadres</Label>
          <Input id="email" name="email" type="email" defaultValue={salon.email ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Telefoonnummer</Label>
          <Input id="phone" name="phone" defaultValue={salon.phone ?? ""} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Adres</Label>
        <Input id="address" name="address" defaultValue={salon.address ?? ""} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="postalCode">Postcode</Label>
          <Input id="postalCode" name="postalCode" defaultValue={salon.postalCode ?? ""} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="city">Plaats</Label>
          <Input id="city" name="city" defaultValue={salon.city ?? ""} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" defaultValue={salon.website ?? ""} placeholder="https://…" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="self-end">
        {pending ? "Bezig…" : "Opslaan"}
      </Button>
    </form>
  );
}
