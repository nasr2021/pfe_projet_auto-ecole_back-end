/*
  Warnings:

  - You are about to drop the column `idContrat` on the `calendrier` table. All the data in the column will be lost.
  - You are about to drop the column `idNotification` on the `calendrier` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `FK_EVENEMEN_LIEE_NOTIFICA`;

-- DropIndex
DROP INDEX `FK_CALENDRIER_CONTRAT` ON `calendrier`;

-- AlterTable
ALTER TABLE `calendrier` DROP COLUMN `idContrat`,
    DROP COLUMN `idNotification`;
