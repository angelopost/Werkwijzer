-- AlterTable
ALTER TABLE "Shift" ADD COLUMN     "permanentShiftId" TEXT;

-- CreateTable
CREATE TABLE "PermanentShift" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "breakMinutes" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "activeFrom" DATE NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermanentShift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermanentShift_userId_weekday_idx" ON "PermanentShift"("userId", "weekday");

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_permanentShiftId_fkey" FOREIGN KEY ("permanentShiftId") REFERENCES "PermanentShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermanentShift" ADD CONSTRAINT "PermanentShift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermanentShift" ADD CONSTRAINT "PermanentShift_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
