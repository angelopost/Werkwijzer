-- DropForeignKey
ALTER TABLE "Availability" DROP CONSTRAINT "Availability_userId_fkey";

-- DropTable
DROP TABLE "Availability";

-- DropEnum
DROP TYPE "AvailabilityStatus";
