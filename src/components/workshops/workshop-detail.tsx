"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  addWorkshopAction,
  deleteWorkshopAction,
  updateWorkshop,
  updateWorkshopStatus,
  type WorkshopActionState,
} from "@/app/(admin)/workshops/actions";
import { DeleteWorkshopButton } from "./delete-workshop-button";
import { WorkshopStatusBadges } from "./status-badges";
import { WORKSHOP_STATUS_LABEL, type WorkshopDetailData, type WorkshopStatus } from "./types";

type Tone = "green" | "amber" | "neutral";

const SELECTED_TONE: Record<Tone, string> = {
  green: "bg-emerald-600 text-white shadow-sm",
  amber: "bg-amber-500 text-white shadow-sm",
  neutral: "bg-slate-600 text-white shadow-sm dark:bg-slate-500",
};

function ChoiceGroup<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: { value: T; label: string; tone: Tone }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-xl bg-muted p-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => !selected && onChange(option.value)}
              className={cn(
                "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none",
                selected ? SELECTED_TONE[option.tone] : "text-muted-foreground hover:bg-background/70"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FollowUpCard({ workshop }: { workshop: WorkshopDetailData }) {
  const [flags, setFlags] = useState({
    status: workshop.status,
    paymentLinkSent: workshop.paymentLinkSent,
    paid: workshop.paid,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  function change(patch: Partial<typeof flags>) {
    const previous = flags;
    setFlags({ ...flags, ...patch });
    setError(null);
    startTransition(async () => {
      const result = await updateWorkshopStatus(workshop.id, patch);
      if (result?.error) {
        setFlags(previous);
        setError(result.error);
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Opvolging</h3>
        <span className="text-xs text-muted-foreground">
          {saving ? "Opslaan…" : "Wijzigingen worden direct opgeslagen"}
        </span>
      </div>

      <WorkshopStatusBadges {...flags} />

      <div className="flex flex-col gap-4 border-t pt-4">
        <ChoiceGroup<WorkshopStatus>
          label="Status"
          value={flags.status}
          onChange={(status) => change({ status })}
          options={(["OPEN", "REMINDER", "AFGEHANDELD"] as const).map((value) => ({
            value,
            label: WORKSHOP_STATUS_LABEL[value],
            tone: value === "AFGEHANDELD" ? "green" : value === "REMINDER" ? "amber" : "neutral",
          }))}
        />
        <ChoiceGroup<"ja" | "nee">
          label="Betaallink verstuurd?"
          value={flags.paymentLinkSent ? "ja" : "nee"}
          onChange={(v) => change({ paymentLinkSent: v === "ja" })}
          options={[
            { value: "ja", label: "Ja", tone: "green" },
            { value: "nee", label: "Nee", tone: "neutral" },
          ]}
        />
        <ChoiceGroup<"ja" | "nee">
          label="Workshop betaald?"
          value={flags.paid ? "ja" : "nee"}
          onChange={(v) => change({ paid: v === "ja" })}
          options={[
            { value: "ja", label: "Ja", tone: "green" },
            { value: "nee", label: "Nee", tone: "neutral" },
          ]}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}

function ActionsCard({ workshop, todayKey }: { workshop: WorkshopDetailData; todayKey: string }) {
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
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs">
      <h3 className="text-sm font-semibold">Acties en reacties</h3>

      <form action={action} className="flex flex-col gap-3 rounded-xl bg-muted/50 p-3">
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actionDate">Datum</Label>
            <Input
              id="actionDate"
              name="date"
              type="date"
              required
              defaultValue={todayKey}
              className="block w-full max-w-full overflow-hidden bg-background"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="actionDescription">Wat is er gedaan?</Label>
            <Input
              id="actionDescription"
              name="description"
              required
              maxLength={1000}
              placeholder="Bijvoorbeeld: opnieuw gebeld"
              className="bg-background"
            />
          </div>
        </div>
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Bezig…" : "Actie toevoegen"}
        </Button>
      </form>

      {workshop.actions.length === 0 ? (
        <p className="py-2 text-center text-sm text-muted-foreground">Nog geen acties vermeld.</p>
      ) : (
        <ol className="relative flex flex-col gap-4 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-border">
          {workshop.actions.map((item, index) => (
            <li key={item.id} className="group relative flex items-start gap-3">
              <span
                className={cn(
                  "absolute top-1.5 -left-6 size-[11px] rounded-full border-2 border-card",
                  index === 0 ? "bg-primary" : "bg-muted-foreground/40"
                )}
              />
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
    </section>
  );
}

function DetailsCard({ workshop }: { workshop: WorkshopDetailData }) {
  const [state, action, pending] = useActionState<WorkshopActionState, FormData>(
    updateWorkshop.bind(null, workshop.id),
    undefined
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border bg-card p-4 shadow-xs">
      <h3 className="text-sm font-semibold">Gegevens en bijzonderheden</h3>
      <form action={action} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Naam</Label>
            <Input id="name" name="name" required maxLength={200} defaultValue={workshop.name} />
          </div>
          <div className="flex flex-col gap-1.5">
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

        <div className="flex flex-col gap-1.5">
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
    </section>
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
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">{workshop.name}</h2>
        <p className="text-sm text-muted-foreground">{workshop.dateLabel}</p>
      </div>

      <FollowUpCard workshop={workshop} />
      <ActionsCard workshop={workshop} todayKey={todayKey} />
      <DetailsCard
        key={`${workshop.name}|${workshop.dateKey}|${workshop.notes ?? ""}`}
        workshop={workshop}
      />

      <DeleteWorkshopButton workshopId={workshop.id} name={workshop.name} />
    </div>
  );
}
