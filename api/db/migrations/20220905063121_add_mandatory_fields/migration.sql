/*
  Warnings:

  - Made the column `date` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `type` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
