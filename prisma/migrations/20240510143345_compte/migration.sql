/*
  Warnings:

  - You are about to drop the `gerantecole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `FK_Ger_idUser`;

-- DropForeignKey
ALTER TABLE `gerantecole` DROP FOREIGN KEY `gerantecole_ibfk_2`;

-- DropForeignKey
ALTER TABLE `gerantecole` DROP FOREIGN KEY `gerantecole_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tarification` DROP FOREIGN KEY `tarification_ibfk_3`;

-- DropTable
DROP TABLE `gerantecole`;
