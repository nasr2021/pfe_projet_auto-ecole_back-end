/*
  Warnings:

  - You are about to drop the `moniteur` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `moniteur` DROP FOREIGN KEY `moniteur_ibfk_2`;

-- DropForeignKey
ALTER TABLE `moniteur` DROP FOREIGN KEY `moniteur_ibfk_1`;

-- DropTable
DROP TABLE `moniteur`;
