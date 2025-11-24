/*
  Warnings:

  - You are about to drop the column `obsVaultMcpTokenLimit` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "obsVaultMcpTokenLimit",
ADD COLUMN     "apiServiceCallLimit" INTEGER NOT NULL DEFAULT 20;
