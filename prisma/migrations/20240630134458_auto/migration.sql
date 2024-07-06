/*
  Warnings:

  - You are about to alter the column `date_creation` on the `notification` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Timestamp(0)`.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `date_creation` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0);
