/*
  Warnings:

  - You are about to drop the column `idCompteConnecte` on the `autoecole` table. All the data in the column will be lost.
  - You are about to drop the column `idForfait` on the `autoecole` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `autoecole` DROP FOREIGN KEY `fk_forfait`;

-- DropForeignKey
ALTER TABLE `forfait` DROP FOREIGN KEY `fk_forfait_autoecole`;

-- DropIndex
DROP INDEX `fk_user` ON `autoecole`;

-- AlterTable
ALTER TABLE `autoecole` DROP COLUMN `idCompteConnecte`,
    DROP COLUMN `idForfait`;
