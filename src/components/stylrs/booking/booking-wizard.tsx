"use client";

import { useMemo, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/stylrs/format";
import { weekdayFromDate } from "@/lib/stylrs/constants";
import { Check, ChevronLeft, Loader2 } from "lucide-react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  category: string | null;
  employeeIds: string[];
};
type Employee = { id: string; firstName: string; lastName: string; color: string };
type BookingSettings = {
  allowEmployeeSelection: boolean;
  allowNoPreference: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  maxAdvanceDays: number;
};

type Step = "service" | "employee" | "date" | "time" | "details" | "confirm" | "done";

const STEP_LABELS: Record<Step, string> = {
  service: "Behandeling",
  employee: "Medewerker",
  date: "Datum",
  time: "Tijd",
  details: "Gegevens",
  confirm: "Bevestigen",
  done: "Klaar",
};

export function BookingWizard({
  slug,
  salonName,
  services,
  employees,
  bookingSettings,
  closedWeekdays,
}: {
  slug: string;
  salonName: string;
  services: Service[];
  employees: Employee[];
  bookingSettings: BookingSettings;
  closedWeekdays: Set<number>;
}) {
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null | "none">(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<{ startTime: string; endTime: string } | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const eligibleEmployees = useMemo(
    () => (service ? employees.filter((e) => service.employeeIds.includes(e.id)) : []),
    [service, employees]
  );

  const steps: Step[] = useMemo(() => {
    const s: Step[] = ["service"];
    if (bookingSettings.allowEmployeeSelection) s.push("employee");
    s.push("date", "time", "details", "confirm");
    return s;
  }, [bookingSettings.allowEmployeeSelection]);
  const currentIndex = steps.indexOf(step);

  function goBack() {
    if (currentIndex > 0) setStep(steps[currentIndex - 1]);
  }

  async function loadSlots(forDate: Date) {
    if (!service) return;
    setLoadingSlots(true);
    setSlots([]);
    setTime(null);
    try {
      const params = new URLSearchParams({
        serviceId: service.id,
        date: format(forDate, "yyyy-MM-dd"),
      });
      if (employeeId && employeeId !== "none") params.set("employeeId", employeeId);
      const res = await fetch(`/api/stylrs/public/${slug}/availability?${params}`);
      const json = await res.json();
      setSlots((json.slots ?? []).map((s: { time: string }) => s.time));
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleSubmit() {
    if (!service || !date || !time) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/stylrs/public/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          employeeId: employeeId && employeeId !== "none" ? employeeId : undefined,
          date: format(date, "yyyy-MM-dd"),
          time,
          firstName,
          lastName,
          email,
          phone,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }
      setConfirmed({ startTime: json.appointment.startTime, endTime: json.appointment.endTime });
      setStep("done");
    } catch {
      setSubmitError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  const upcomingDays = useMemo(() => {
    const days: Date[] = [];
    const max = Math.min(bookingSettings.maxAdvanceDays, 30);
    for (let i = 0; i <= max; i++) {
      const d = addDays(new Date(), i);
      if (!closedWeekdays.has(weekdayFromDate(d))) days.push(d);
    }
    return days;
  }, [bookingSettings.maxAdvanceDays, closedWeekdays]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      {step !== "done" && (
        <div className="flex items-center gap-2">
          {currentIndex > 0 && (
            <Button variant="ghost" size="icon-sm" onClick={goBack} aria-label="Terug">
              <ChevronLeft className="size-4" />
            </Button>
          )}
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              Stap {currentIndex + 1} van {steps.length}
            </p>
            <p className="text-sm font-medium text-foreground">{STEP_LABELS[step]}</p>
          </div>
        </div>
      )}

      {step === "service" && (
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                setEmployeeId(null);
                setStep(bookingSettings.allowEmployeeSelection ? "employee" : "date");
              }}
              className="flex items-center justify-between rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary"
            >
              <div>
                <p className="font-medium text-foreground">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.durationMinutes} minuten</p>
              </div>
              <span className="font-medium text-foreground">{formatCurrency(s.price)}</span>
            </button>
          ))}
          {services.length === 0 && (
            <p className="text-sm text-muted-foreground">Deze salon heeft nog geen behandelingen beschikbaar.</p>
          )}
        </div>
      )}

      {step === "employee" && (
        <div className="flex flex-col gap-2">
          {bookingSettings.allowNoPreference && (
            <button
              type="button"
              onClick={() => {
                setEmployeeId("none");
                setStep("date");
              }}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">?</span>
              <span className="font-medium text-foreground">Geen voorkeur</span>
            </button>
          )}
          {eligibleEmployees.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => {
                setEmployeeId(e.id);
                setStep("date");
              }}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary"
            >
              <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="font-medium text-foreground">
                {e.firstName} {e.lastName}
              </span>
            </button>
          ))}
        </div>
      )}

      {step === "date" && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {upcomingDays.map((d) => (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => {
                setDate(d);
                loadSlots(d);
                setStep("time");
              }}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl border bg-card p-3 text-center shadow-sm transition-colors hover:border-primary",
                date && isSameDay(date, d) && "border-primary"
              )}
            >
              <span className="text-xs text-muted-foreground">{format(d, "EEE", { locale: nl })}</span>
              <span className="text-sm font-medium text-foreground">{format(d, "d MMM", { locale: nl })}</span>
            </button>
          ))}
        </div>
      )}

      {step === "time" && (
        <div>
          {loadingSlots ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : slots.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Geen beschikbare tijden op deze dag. Kies een andere datum.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTime(t);
                    setStep("details");
                  }}
                  className={cn(
                    "rounded-xl border bg-card p-3 text-center text-sm font-medium shadow-sm transition-colors hover:border-primary",
                    time === t && "border-primary"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "details" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("confirm");
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-firstName">Voornaam</Label>
              <Input id="b-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="b-lastName">Achternaam</Label>
              <Input id="b-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="b-email">E-mailadres{bookingSettings.requireEmail ? "" : " (optioneel)"}</Label>
            <Input
              id="b-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={bookingSettings.requireEmail}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="b-phone">Telefoonnummer{bookingSettings.requirePhone ? "" : " (optioneel)"}</Label>
            <Input
              id="b-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={bookingSettings.requirePhone}
            />
          </div>
          <Button type="submit">Volgende</Button>
        </form>
      )}

      {step === "confirm" && service && date && time && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <Row label="Behandeling" value={service.name} />
            {employeeId && employeeId !== "none" && (
              <Row
                label="Medewerker"
                value={
                  eligibleEmployees.find((e) => e.id === employeeId)
                    ? `${eligibleEmployees.find((e) => e.id === employeeId)!.firstName} ${eligibleEmployees.find((e) => e.id === employeeId)!.lastName}`
                    : "—"
                }
              />
            )}
            <Row label="Datum" value={format(date, "EEEE d MMMM", { locale: nl })} />
            <Row label="Tijd" value={time} />
            <Row label="Prijs" value={formatCurrency(service.price)} />
          </div>
          {submitError && <p className="text-sm text-destructive">{submitError}</p>}
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Bezig…" : "Afspraak bevestigen"}
          </Button>
        </div>
      )}

      {step === "done" && confirmed && (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center shadow-sm">
          <span className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <Check className="size-6" />
          </span>
          <p className="text-lg font-semibold text-foreground">Je afspraak staat gepland!</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(confirmed.startTime), "EEEE d MMMM, HH:mm", { locale: nl })} bij {salonName}
          </p>
          {email && <p className="text-xs text-muted-foreground">Je ontvangt ook een bevestiging per e-mail.</p>}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
