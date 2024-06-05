/*
  Warnings:

  - You are about to drop the column `idforfaitCategorie` on the `forfait` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `forfait` DROP FOREIGN KEY `forfait_ibfk_1`;

-- AlterTable
ALTER TABLE `forfait` DROP COLUMN `idforfaitCategorie`;
