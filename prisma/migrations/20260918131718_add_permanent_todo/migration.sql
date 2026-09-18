-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "permanentTodoId" TEXT;

-- CreateTable
CREATE TABLE "PermanentTodo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "weekday" INTEGER NOT NULL,
    "priority" "TodoPriority" NOT NULL DEFAULT 'NORMAAL',
    "assigneeId" TEXT,
    "activeFrom" DATE NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermanentTodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermanentTodoException" (
    "id" TEXT NOT NULL,
    "permanentTodoId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PermanentTodoException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PermanentTodo_assigneeId_weekday_idx" ON "PermanentTodo"("assigneeId", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "PermanentTodoException_permanentTodoId_date_key" ON "PermanentTodoException"("permanentTodoId", "date");

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_permanentTodoId_fkey" FOREIGN KEY ("permanentTodoId") REFERENCES "PermanentTodo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermanentTodo" ADD CONSTRAINT "PermanentTodo_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermanentTodo" ADD CONSTRAINT "PermanentTodo_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermanentTodoException" ADD CONSTRAINT "PermanentTodoException_permanentTodoId_fkey" FOREIGN KEY ("permanentTodoId") REFERENCES "PermanentTodo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
