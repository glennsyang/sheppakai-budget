/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_transactionId_fkey";

-- DropIndex
DROP INDEX "Category_transactionId_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "transactionId";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "categoryId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
