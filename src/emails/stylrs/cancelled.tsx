import { Text } from "@react-email/components";
import { EmailLayout, DetailRow } from "./layout";
import type { AppointmentEmailInfo } from "./appointment-info";

export function CancelledEmail(info: AppointmentEmailInfo) {
  return (
    <EmailLayout previewText={`Je afspraak bij ${info.salonName} is geannuleerd`} heading="Je afspraak is geannuleerd">
      <Text style={{ fontSize: 14 }}>Hoi {info.customerName},</Text>
      <Text style={{ fontSize: 14 }}>De onderstaande afspraak is geannuleerd.</Text>
      <DetailRow label="Behandeling" value={info.serviceName} />
      <DetailRow label="Datum" value={info.dateLabel} />
      <DetailRow label="Tijd" value={info.timeLabel} />
      <Text style={{ fontSize: 14 }}>Neem gerust contact op met {info.salonName} om een nieuwe afspraak te maken.</Text>
    </EmailLayout>
  );
}
