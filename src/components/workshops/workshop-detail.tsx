"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addWorkshopAction,
  deleteWorkshopAction,
  updateWorkshop,
  type WorkshopActionState,
} from "@/app/(admin)/workshops/actions";
import { DeleteWorkshopButton } from "./delete-workshop-button";
import { WORKSHOP_STATUS_LABEL, type WorkshopDetailData, type WorkshopStatus } from "./types";

const STATUS_BADGE_VARIANT: Record<WorkshopStatus, "secondary" | "destructive" | "default"> = {
  OPEN: "secondary",
  REMINDER: "destructive",
  AFGEHANDELD: "default",
};

function YesNoSelect({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select name={name} defaultValue={defaultValue ? "ja" : "nee"}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue>{(value: string | null) => (value === "ja" ? "Ja" : "Nee")}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ja">Ja</SelectItem>
          <SelectItem value="nee">Nee</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function DetailsForm({ workshop }: { workshop: WorkshopDetailData }) {
  const [state, action, pending] = useActionState<WorkshopActionState, FormData>(
    updateWorkshop.bind(null, workshop.id),
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Naam</Label>
          <Input id="name" name="name" required maxLength={200} defaultValue={workshop.name} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            name="date"
            type="date"
            required
            className="block w-full max-w-full overflow-hidden"
            defaultValue={workshop.dateKey}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={workshop.status}>
          <SelectTrigger id="status" className="w-full">
            <SelectValue>
              {(value: string | null) => WORKSHOP_STATUS_LABEL[(value ?? "OPEN") as WorkshopStatus]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="REMINDER">Reminder sturen</SelectItem>
            <SelectItem value="AFGEHANDELD">Afgehandeld</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <YesNoSelect
          id="paymentLinkSent"
          name="paymentLinkSent"
          label="Betaallink verstuurd?"
          defaultValue={workshop.paymentLinkSent}
        />
        <YesNoSelect id="paid" name="paid" label="Workshop betaald?" defaultValue={workshop.paid} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Bijzonderheden</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Bijvoorbeeld: kan alleen op maandag, of komt iets later"
          maxLength={2000}
          defaultValue={workshop.notes ?? ""}
        />
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex items-center justify-end gap-3">
        {state?.success && !pending && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">Opgeslagen</span>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Bezig…" : "Opslaan"}
        </Button>
      </div>
    </form>
  );
}

function ActionsSection({ workshop, todayKey }: { workshop: WorkshopDetailData; todayKey: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<WorkshopActionState, FormData>(
    addWorkshopAction.bind(null, workshop.id),
    undefined
  );

  async function handleDelete(actionId: string) {
    await deleteWorkshopAction(actionId);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={action} className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="actionDate">Datum</Label>
            <Input
              id="actionDate"
              name="date"
              type="date"
              required
              defaultValue={todayKey}
              className="block w-full max-w-full overflow-hidden"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="actionDescription">Wat is er gedaan?</Label>
            <Input
              id="actionDescription"
              name="description"
              required
              maxLength={1000}
              placeholder="Bijvoorbeeld: opnieuw gebeld"
            />
          </div>
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Bezig…" : "Actie toevoegen"}
        </Button>
      </form>

      {workshop.actions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nog geen acties vermeld.</p>
      ) : (
        <ol className="flex flex-col divide-y rounded-lg border bg-background">
          {workshop.actions.map((item) => (
            <li key={item.id} className="flex items-start gap-3 p-3">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-xs font-semibold text-muted-foreground">{item.dateLabel}</span>
                <span className="text-sm break-words whitespace-pre-wrap">{item.description}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Actie verwijderen"
                onClick={() => handleDelete(item.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function WorkshopDetail({
  workshop,
  todayKey,
}: {
  workshop: WorkshopDetailData;
  todayKey: string;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{workshop.name}</h2>
        <p className="text-sm text-muted-foreground">{workshop.dateLabel}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={STATUS_BADGE_VARIANT[workshop.status]}>
            {WORKSHOP_STATUS_LABEL[workshop.status]}
          </Badge>
          <Badge variant={workshop.paymentLinkSent ? "default" : "secondary"}>
            {workshop.paymentLinkSent ? "Betaallink verstuurd" : "Betaallink nog niet verstuurd"}
          </Badge>
          <Badge variant={workshop.paid ? "default" : "secondary"}>
            {workshop.paid ? "Betaald" : "Nog niet betaald"}
          </Badge>
        </div>
      </div>

      <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Gegevens</h3>
        <DetailsForm key={workshop.updatedAt} workshop={workshop} />
      </section>

      <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <h3 className="text-sm font-semibold">Acties en reacties</h3>
        <ActionsSection workshop={workshop} todayKey={todayKey} />
      </section>

      <DeleteWorkshopButton workshopId={workshop.id} name={workshop.name} />
    </div>
  );
}
