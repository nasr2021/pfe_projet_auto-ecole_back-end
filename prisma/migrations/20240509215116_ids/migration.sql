/*
  Warnings:

  - You are about to drop the column `idEvenement` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `iduserconnecte` on the `cars` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `fk_cars_event`;

-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `cars_ibfk_2`;

-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `fk_iduserconnecte_cars`;

-- AlterTable
ALTER TABLE `cars` DROP COLUMN `idEvenement`,
    DROP COLUMN `iduserconnecte`;
