/*
  Warnings:

  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('REG_USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin",
ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'REG_USER';
