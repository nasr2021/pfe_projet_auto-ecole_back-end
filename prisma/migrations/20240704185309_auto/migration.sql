/*
  Warnings:

  - You are about to drop the column `idNotification` on the `demande` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `demande` DROP FOREIGN KEY `FK_DEMANDE_LIEE_NOTIFICA`;

-- AlterTable
ALTER TABLE `demande` DROP COLUMN `idNotification`;
