-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('VAST', 'NUL_UREN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "contractType" "ContractType";
