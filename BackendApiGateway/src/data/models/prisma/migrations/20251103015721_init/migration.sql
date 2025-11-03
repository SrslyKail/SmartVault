-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "obsVaultMcpTokenLimit" INTEGER NOT NULL DEFAULT 20,
    "obsVaultMcpTokensUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshTokenInfo" (
    "userId" TEXT NOT NULL,
    "refreshTokenVersion" INTEGER NOT NULL DEFAULT 1
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_hashedPassword_key" ON "User"("hashedPassword");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokenInfo_userId_key" ON "RefreshTokenInfo"("userId");

-- AddForeignKey
ALTER TABLE "RefreshTokenInfo" ADD CONSTRAINT "RefreshTokenInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
