-- CreateTable
CREATE TABLE "PermanentShiftException" (
    "id" TEXT NOT NULL,
    "permanentShiftId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermanentShiftException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PermanentShiftException_permanentShiftId_date_key" ON "PermanentShiftException"("permanentShiftId", "date");

-- AddForeignKey
ALTER TABLE "PermanentShiftException" ADD CONSTRAINT "PermanentShiftException_permanentShiftId_fkey" FOREIGN KEY ("permanentShiftId") REFERENCES "PermanentShift"("id") ON DELETE CASCADE ON UPDATE CASCADE;
