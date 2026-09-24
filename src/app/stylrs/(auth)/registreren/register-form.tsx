"use client";

import { useActionState } from "react";
import { registerSalon } from "@/actions/stylrs/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerSalon, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="salonName">Salonnaam</Label>
        <Input id="salonName" name="salonName" required autoComplete="organization" />
        {state?.fieldErrors?.salonName && (
          <p className="text-sm text-destructive">{state.fieldErrors.salonName}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ownerName">Jouw naam</Label>
        <Input id="ownerName" name="ownerName" required autoComplete="name" />
        {state?.fieldErrors?.ownerName && (
          <p className="text-sm text-destructive">{state.fieldErrors.ownerName}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        {state?.fieldErrors?.email && (
          <p className="text-sm text-destructive">{state.fieldErrors.email}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" />
        {state?.fieldErrors?.password && (
          <p className="text-sm text-destructive">{state.fieldErrors.password}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
        {state?.fieldErrors?.confirmPassword && (
          <p className="text-sm text-destructive">{state.fieldErrors.confirmPassword}</p>
        )}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Bezig met aanmaken…" : "Salon aanmaken"}
      </Button>
    </form>
  );
}
