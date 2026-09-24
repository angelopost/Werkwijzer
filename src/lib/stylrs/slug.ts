import { prisma } from "@/lib/db";

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "salon";
}

export async function generateUniqueSalonSlug(name: string) {
  const base = slugify(name);
  let candidate = base;
  let suffix = 2;

  while (await prisma.salon.findUnique({ where: { slug: candidate }, select: { id: true } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}
