/*
  Warnings:

  - You are about to drop the column `idUser` on the `permi` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `permi` DROP FOREIGN KEY `FK_PERMI_PRISE_CONDIDAT`;

-- AlterTable
ALTER TABLE `permi` DROP COLUMN `idUser`;
