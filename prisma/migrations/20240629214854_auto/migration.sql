/*
  Warnings:

  - Made the column `date_creation` on table `notification` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `notification` MODIFY `date_creation` VARCHAR(191) NOT NULL;
