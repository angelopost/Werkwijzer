import { Text } from "@react-email/components";
import { EmailLayout, DetailRow } from "./layout";
import type { AppointmentEmailInfo } from "./appointment-info";

export function ReminderEmail(info: AppointmentEmailInfo) {
  return (
    <EmailLayout
      previewText={`Je hebt morgen een afspraak bij ${info.salonName}`}
      heading={`Je hebt binnenkort een afspraak bij ${info.salonName}`}
    >
      <Text style={{ fontSize: 14 }}>Hoi {info.customerName},</Text>
      <Text style={{ fontSize: 14 }}>Even een herinnering aan je aankomende afspraak.</Text>
      <DetailRow label="Behandeling" value={info.serviceName} />
      <DetailRow label="Medewerker" value={info.employeeName} />
      <DetailRow label="Datum" value={info.dateLabel} />
      <DetailRow label="Tijd" value={info.timeLabel} />
      {info.salonAddress && <DetailRow label="Adres" value={info.salonAddress} />}
    </EmailLayout>
  );
}
