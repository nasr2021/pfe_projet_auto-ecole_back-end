/*
  Warnings:

  - You are about to drop the `service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tarification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tarification` DROP FOREIGN KEY `FK_TARIFICA_CREER_PAT_GERANTEC`;

-- DropForeignKey
ALTER TABLE `tarification` DROP FOREIGN KEY `FK_TARIFICA_BENEFICIE_SERVICE`;

-- DropForeignKey
ALTER TABLE `tarification` DROP FOREIGN KEY `FK_TARIFICA_BENEFICIE_USER`;

-- DropTable
DROP TABLE `service`;

-- DropTable
DROP TABLE `tarification`;
