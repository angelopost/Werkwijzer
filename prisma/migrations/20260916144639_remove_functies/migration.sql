-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_functieId_fkey";

-- DropForeignKey
ALTER TABLE "UserFunctie" DROP CONSTRAINT "UserFunctie_functieId_fkey";

-- DropForeignKey
ALTER TABLE "UserFunctie" DROP CONSTRAINT "UserFunctie_userId_fkey";

-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "functieId";

-- DropTable
DROP TABLE "Functie";

-- DropTable
DROP TABLE "UserFunctie";
