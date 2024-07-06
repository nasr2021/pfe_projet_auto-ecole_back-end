/*
  Warnings:

  - You are about to drop the column `Ger_idUser` on the `tarification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tarification` DROP FOREIGN KEY `FK_TARIFICATION_GERANT`;

-- AlterTable
ALTER TABLE `tarification` DROP COLUMN `Ger_idUser`;
