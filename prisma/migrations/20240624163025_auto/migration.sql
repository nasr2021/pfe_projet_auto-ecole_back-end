/*
  Warnings:

  - You are about to drop the `tarif` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `tarif` DROP FOREIGN KEY `fk_autoecole_tarif`;

-- DropTable
DROP TABLE `tarif`;
