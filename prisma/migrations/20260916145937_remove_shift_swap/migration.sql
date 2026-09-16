-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('UITNODIGING', 'DIENST_TOEGEWEZEN', 'VERLOF_AANGEVRAAGD', 'VERLOF_GOEDGEKEURD', 'VERLOF_AFGEWEZEN', 'ZIEKMELDING', 'ROOSTER_GEPUBLICEERD');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ShiftSwapRequest" DROP CONSTRAINT "ShiftSwapRequest_requestingUserId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftSwapRequest" DROP CONSTRAINT "ShiftSwapRequest_reviewedById_fkey";

-- DropForeignKey
ALTER TABLE "ShiftSwapRequest" DROP CONSTRAINT "ShiftSwapRequest_shiftId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftSwapRequest" DROP CONSTRAINT "ShiftSwapRequest_targetUserId_fkey";

-- DropTable
DROP TABLE "ShiftSwapRequest";

-- DropEnum
DROP TYPE "SwapStatus";
