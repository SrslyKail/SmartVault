-- CreateTable
CREATE TABLE "UserApiServiceUsage" (
    "totalNumApiCallsMade" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserApiServiceUsage_userId_key" ON "UserApiServiceUsage"("userId");

-- AddForeignKey
ALTER TABLE "UserApiServiceUsage" ADD CONSTRAINT "UserApiServiceUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
