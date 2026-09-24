import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { weekdayFromDate } from "@/lib/stylrs/constants";

const SLOT_STEP_MINUTES = 15;

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToDate(base: Date, minutes: number) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

function dateOnly(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/// Werktijd-vensters van een medewerker op een gegeven datum, in minuten sinds
/// middernacht, met eventuele pauze eruit gesneden. Leeg = werkt niet die dag.
function employeeWindowsForDate(
  availability: { weekday: number; startTime: string; endTime: string; breakStartTime: string | null; breakEndTime: string | null }[],
  timeOff: { startDate: Date; endDate: Date }[],
  date: Date
): [number, number][] {
  const target = dateOnly(date).getTime();
  const onLeave = timeOff.some((t) => dateOnly(t.startDate).getTime() <= target && target <= dateOnly(t.endDate).getTime());
  if (onLeave) return [];

  const weekday = weekdayFromDate(date);
  const day = availability.find((a) => a.weekday === weekday);
  if (!day) return [];

  const start = timeToMinutes(day.startTime);
  const end = timeToMinutes(day.endTime);
  if (day.breakStartTime && day.breakEndTime) {
    const breakStart = timeToMinutes(day.breakStartTime);
    const breakEnd = timeToMinutes(day.breakEndTime);
    const windows: [number, number][] = [];
    if (breakStart > start) windows.push([start, Math.min(breakStart, end)]);
    if (breakEnd < end) windows.push([Math.max(breakEnd, start), end]);
    return windows;
  }
  return [[start, end]];
}

function withinWindows(windows: [number, number][], start: number, end: number) {
  return windows.some(([wStart, wEnd]) => start >= wStart && end <= wEnd);
}

type ExistingAppointment = { employeeId: string; startTime: Date; endTime: Date };

function hasConflict(
  appointments: ExistingAppointment[],
  employeeId: string,
  start: Date,
  end: Date,
  bufferMinutes: number
) {
  const bufferMs = bufferMinutes * 60_000;
  return appointments.some((a) => {
    if (a.employeeId !== employeeId) return false;
    const existingStart = a.startTime.getTime() - bufferMs;
    const existingEnd = a.endTime.getTime() + bufferMs;
    return start.getTime() < existingEnd && end.getTime() > existingStart;
  });
}

export async function getEligibleEmployees(salonId: string, serviceId: string, employeeId?: string | null) {
  const employees = await prisma.employee.findMany({
    where: {
      salonId,
      active: true,
      services: { some: { serviceId } },
      ...(employeeId ? { id: employeeId } : {}),
    },
    include: { availability: true, timeOff: true },
  });
  return employees;
}

export async function getAvailableSlots(params: {
  salonId: string;
  serviceId: string;
  employeeId?: string | null;
  date: Date;
}): Promise<{ time: string; startTime: Date; endTime: Date }[]> {
  const { salonId, serviceId, employeeId, date } = params;

  const [salon, service, bookingSettings, openingHours, employees] = await Promise.all([
    prisma.salon.findUnique({ where: { id: salonId } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.bookingSettings.findUnique({ where: { salonId } }),
    prisma.openingHours.findMany({ where: { salonId } }),
    getEligibleEmployees(salonId, serviceId, employeeId),
  ]);

  if (!salon || !service || !bookingSettings || employees.length === 0) return [];

  const weekday = weekdayFromDate(date);
  const hours = openingHours.find((h) => h.weekday === weekday);
  if (!hours || hours.isClosed || !hours.openTime || !hours.closeTime) return [];

  const salonWindow: [number, number] = [timeToMinutes(hours.openTime), timeToMinutes(hours.closeTime)];

  const now = new Date();
  const dayStart = dateOnly(date);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const maxAdvance = new Date();
  maxAdvance.setDate(maxAdvance.getDate() + bookingSettings.maxAdvanceDays);
  if (dayStart.getTime() > dateOnly(maxAdvance).getTime()) return [];
  if (dayStart.getTime() < dateOnly(now).getTime()) return [];

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      salonId,
      employeeId: { in: employees.map((e) => e.id) },
      status: { in: ["CONFIRMED", "COMPLETED"] },
      startTime: { gte: dayStart, lt: dayEnd },
    },
    select: { employeeId: true, startTime: true, endTime: true },
  });

  const employeeWindows = new Map(
    employees.map((e) => [e.id, employeeWindowsForDate(e.availability, e.timeOff, date)])
  );

  const slots: { time: string; startTime: Date; endTime: Date }[] = [];
  const minStart = timeToMinutes(hours.openTime);
  const maxStart = timeToMinutes(hours.closeTime) - service.durationMinutes;

  for (let start = minStart; start <= maxStart; start += SLOT_STEP_MINUTES) {
    const end = start + service.durationMinutes;
    if (!withinWindows([salonWindow], start, end)) continue;

    const startTime = minutesToDate(date, start);
    const endTime = minutesToDate(date, end);

    if (startTime.getTime() < now.getTime() + bookingSettings.minNoticeMinutes * 60_000) continue;

    const someoneFree = employees.some((employee) => {
      const windows = employeeWindows.get(employee.id) ?? [];
      if (!withinWindows(windows, start, end)) return false;
      return !hasConflict(existingAppointments, employee.id, startTime, endTime, bookingSettings.bufferMinutes);
    });

    if (someoneFree) {
      const hh = String(Math.floor(start / 60)).padStart(2, "0");
      const mm = String(start % 60).padStart(2, "0");
      slots.push({ time: `${hh}:${mm}`, startTime, endTime });
    }
  }

  return slots;
}

/// Vindt, binnen een transactie, een medewerker die op het gekozen tijdstip
/// daadwerkelijk vrij is — herberekend op het moment van boeken zodat twee
/// (bijna) gelijktijdige boekingen elkaar niet kunnen overlappen.
export async function findAvailableEmployeeForBooking(
  tx: Prisma.TransactionClient,
  params: {
    salonId: string;
    serviceId: string;
    employeeId?: string | null;
    startTime: Date;
    endTime: Date;
  }
): Promise<string | null> {
  const { salonId, serviceId, employeeId, startTime, endTime } = params;

  const employees = await tx.employee.findMany({
    where: {
      salonId,
      active: true,
      services: { some: { serviceId } },
      ...(employeeId ? { id: employeeId } : {}),
    },
    include: { availability: true, timeOff: true },
  });
  if (employees.length === 0) return null;

  const bookingSettings = await tx.bookingSettings.findUnique({ where: { salonId } });
  const bufferMinutes = bookingSettings?.bufferMinutes ?? 0;

  const dayStart = dateOnly(startTime);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existingAppointments = await tx.appointment.findMany({
    where: {
      salonId,
      employeeId: { in: employees.map((e) => e.id) },
      status: { in: ["CONFIRMED", "COMPLETED"] },
      startTime: { gte: dayStart, lt: dayEnd },
    },
    select: { employeeId: true, startTime: true, endTime: true },
  });

  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const endMinutes = endMinutesFrom(startTime, endTime);

  for (const employee of employees) {
    const windows = employeeWindowsForDate(employee.availability, employee.timeOff, startTime);
    if (!withinWindows(windows, startMinutes, endMinutes)) continue;
    if (hasConflict(existingAppointments, employee.id, startTime, endTime, bufferMinutes)) continue;
    return employee.id;
  }

  return null;
}

function endMinutesFrom(start: Date, end: Date) {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60_000);
  return startMinutes + durationMinutes;
}

/// Controleert of een specifieke medewerker vrij is op het gekozen tijdstip.
/// Gebruikt door de agenda voor handmatig ingeplande afspraken.
export async function isEmployeeFree(
  tx: Prisma.TransactionClient,
  params: {
    employeeId: string;
    startTime: Date;
    endTime: Date;
    bufferMinutes: number;
    excludeAppointmentId?: string;
  }
): Promise<boolean> {
  const { employeeId, startTime, endTime, bufferMinutes, excludeAppointmentId } = params;
  const dayStart = dateOnly(startTime);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const existingAppointments = await tx.appointment.findMany({
    where: {
      employeeId,
      status: { in: ["CONFIRMED", "COMPLETED"] },
      startTime: { gte: dayStart, lt: dayEnd },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    select: { employeeId: true, startTime: true, endTime: true },
  });

  return !hasConflict(existingAppointments, employeeId, startTime, endTime, bufferMinutes);
}
