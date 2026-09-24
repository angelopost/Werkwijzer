import "server-only";
import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateLong, formatTime } from "@/lib/stylrs/format";
import { ConfirmationEmail } from "@/emails/stylrs/confirmation";
import { ReminderEmail } from "@/emails/stylrs/reminder";
import { RescheduledEmail } from "@/emails/stylrs/rescheduled";
import { CancelledEmail } from "@/emails/stylrs/cancelled";
import type { AppointmentEmailInfo } from "@/emails/stylrs/appointment-info";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.STYLRS_EMAIL_FROM || "STYLRS <onboarding@resend.dev>";

async function getAppointmentWithContext(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      salon: { include: { emailSettings: true } },
      customer: true,
      employee: true,
      service: true,
    },
  });
}

function toEmailInfo(
  appointment: NonNullable<Awaited<ReturnType<typeof getAppointmentWithContext>>>
): AppointmentEmailInfo {
  return {
    salonName: appointment.salon.name,
    salonAddress: [appointment.salon.address, appointment.salon.postalCode, appointment.salon.city]
      .filter(Boolean)
      .join(", ") || null,
    salonPhone: appointment.salon.phone,
    customerName: appointment.customer.firstName,
    serviceName: appointment.service.name,
    employeeName: `${appointment.employee.firstName} ${appointment.employee.lastName}`,
    dateLabel: formatDateLong(appointment.startTime),
    timeLabel: formatTime(appointment.startTime),
    priceLabel: formatCurrency(Number(appointment.price)),
  };
}

async function send(to: string, subject: string, react: React.ReactElement) {
  if (!resend) {
    console.log(`[stylrs-email] (geen RESEND_API_KEY ingesteld, e-mail niet verstuurd) aan ${to}: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, react });
  } catch (error) {
    console.error("[stylrs-email] versturen mislukt", error);
  }
}

export async function sendAppointmentConfirmation(appointmentId: string) {
  const appointment = await getAppointmentWithContext(appointmentId);
  if (!appointment || !appointment.customer.email) return;
  if (appointment.salon.emailSettings && !appointment.salon.emailSettings.confirmationEnabled) return;

  await send(
    appointment.customer.email,
    `Je afspraak bij ${appointment.salon.name} is bevestigd`,
    ConfirmationEmail(toEmailInfo(appointment))
  );

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { confirmationSentAt: new Date() },
  });
}

export async function sendAppointmentRescheduled(appointmentId: string) {
  const appointment = await getAppointmentWithContext(appointmentId);
  if (!appointment || !appointment.customer.email) return;
  if (appointment.salon.emailSettings && !appointment.salon.emailSettings.rescheduledEnabled) return;

  await send(
    appointment.customer.email,
    `Je afspraak bij ${appointment.salon.name} is verzet`,
    RescheduledEmail(toEmailInfo(appointment))
  );
}

export async function sendAppointmentCancelled(appointmentId: string) {
  const appointment = await getAppointmentWithContext(appointmentId);
  if (!appointment || !appointment.customer.email) return;
  if (appointment.salon.emailSettings && !appointment.salon.emailSettings.cancelledEnabled) return;

  await send(
    appointment.customer.email,
    `Je afspraak bij ${appointment.salon.name} is geannuleerd`,
    CancelledEmail(toEmailInfo(appointment))
  );
}

/// Wordt aangeroepen door de cron-endpoint (zie /api/stylrs/cron/reminders).
/// Stuurt herinneringen voor afspraken die over `reminderHoursBefore` uur beginnen
/// en nog geen herinnering hebben gehad.
export async function sendDueReminders() {
  const salons = await prisma.salon.findMany({
    include: { emailSettings: true },
    where: { emailSettings: { reminderEnabled: true } },
  });

  let sent = 0;
  for (const salon of salons) {
    const hoursBefore = salon.emailSettings!.reminderHoursBefore;
    const windowStart = new Date(Date.now() + hoursBefore * 60 * 60 * 1000);
    const windowEnd = new Date(windowStart.getTime() + 60 * 60 * 1000);

    const dueAppointments = await prisma.appointment.findMany({
      where: {
        salonId: salon.id,
        status: "CONFIRMED",
        reminderSentAt: null,
        startTime: { gte: windowStart, lt: windowEnd },
      },
      include: { customer: true, employee: true, service: true, salon: { include: { emailSettings: true } } },
    });

    for (const appointment of dueAppointments) {
      if (!appointment.customer.email) continue;
      await send(
        appointment.customer.email,
        `Je hebt binnenkort een afspraak bij ${salon.name}`,
        ReminderEmail(toEmailInfo(appointment))
      );
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { reminderSentAt: new Date() },
      });
      sent += 1;
    }
  }

  return sent;
}
