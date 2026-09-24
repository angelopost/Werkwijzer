import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAvailableSlots } from "@/lib/stylrs/availability";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const employeeId = searchParams.get("employeeId");
  const dateParam = searchParams.get("date");

  if (!serviceId || !dateParam) {
    return NextResponse.json({ error: "serviceId en date zijn verplicht" }, { status: 400 });
  }

  const date = new Date(`${dateParam}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Ongeldige datum" }, { status: 400 });
  }

  const salon = await prisma.salon.findUnique({ where: { slug }, select: { id: true } });
  if (!salon) {
    return NextResponse.json({ error: "Salon niet gevonden" }, { status: 404 });
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || service.salonId !== salon.id || !service.active) {
    return NextResponse.json({ error: "Behandeling niet gevonden" }, { status: 404 });
  }

  if (employeeId) {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee || employee.salonId !== salon.id) {
      return NextResponse.json({ error: "Medewerker niet gevonden" }, { status: 404 });
    }
  }

  const slots = await getAvailableSlots({
    salonId: salon.id,
    serviceId,
    employeeId: employeeId || null,
    date,
  });

  return NextResponse.json({ slots: slots.map((s) => ({ time: s.time })) });
}
