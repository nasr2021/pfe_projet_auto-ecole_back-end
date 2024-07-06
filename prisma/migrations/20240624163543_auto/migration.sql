/*
  Warnings:

  - You are about to drop the column `idCategorie` on the `calendrier` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `category_ibfk_1`;

-- AlterTable
ALTER TABLE `calendrier` DROP COLUMN `idCategorie`;
