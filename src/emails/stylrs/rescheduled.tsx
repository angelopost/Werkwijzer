import { Text } from "@react-email/components";
import { EmailLayout, DetailRow } from "./layout";
import type { AppointmentEmailInfo } from "./appointment-info";

export function RescheduledEmail(info: AppointmentEmailInfo) {
  return (
    <EmailLayout previewText={`Je afspraak bij ${info.salonName} is verzet`} heading="Je afspraak is verzet">
      <Text style={{ fontSize: 14 }}>Hoi {info.customerName},</Text>
      <Text style={{ fontSize: 14 }}>
        {info.salonName} heeft je afspraak verzet. Hieronder de nieuwe details.
      </Text>
      <DetailRow label="Behandeling" value={info.serviceName} />
      <DetailRow label="Medewerker" value={info.employeeName} />
      <DetailRow label="Nieuwe datum" value={info.dateLabel} />
      <DetailRow label="Nieuwe tijd" value={info.timeLabel} />
    </EmailLayout>
  );
}
