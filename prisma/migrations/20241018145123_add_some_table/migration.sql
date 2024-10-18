/*
  Warnings:

  - You are about to drop the column `updated_at` on the `Store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "updated_at",
ADD COLUMN     "category" TEXT,
ADD COLUMN     "dateofSale" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sold" BOOLEAN,
ALTER COLUMN "content" SET DATA TYPE TEXT;
