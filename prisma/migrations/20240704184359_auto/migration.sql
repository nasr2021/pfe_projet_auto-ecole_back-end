/*
  Warnings:

  - You are about to drop the column `date_modification` on the `calendrier` table. All the data in the column will be lost.
  - You are about to drop the column `idCompteConnecte` on the `calendrier` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `FK_CALENDRIER_CONTRAT`;

-- AlterTable
ALTER TABLE `calendrier` DROP COLUMN `date_modification`,
    DROP COLUMN `idCompteConnecte`;
