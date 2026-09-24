import { Text } from "@react-email/components";
import { EmailLayout, DetailRow } from "./layout";
import type { AppointmentEmailInfo } from "./appointment-info";

export function ConfirmationEmail(info: AppointmentEmailInfo) {
  return (
    <EmailLayout previewText={`Je afspraak bij ${info.salonName} is bevestigd`} heading="Je afspraak is bevestigd">
      <Text style={{ fontSize: 14 }}>Hoi {info.customerName},</Text>
      <Text style={{ fontSize: 14 }}>Je afspraak staat gepland. Tot dan!</Text>
      <DetailRow label="Salon" value={info.salonName} />
      <DetailRow label="Behandeling" value={info.serviceName} />
      <DetailRow label="Medewerker" value={info.employeeName} />
      <DetailRow label="Datum" value={info.dateLabel} />
      <DetailRow label="Tijd" value={info.timeLabel} />
      <DetailRow label="Prijs" value={info.priceLabel} />
      {info.salonAddress && <DetailRow label="Adres" value={info.salonAddress} />}
      {info.salonPhone && <DetailRow label="Telefoon" value={info.salonPhone} />}
    </EmailLayout>
  );
}
