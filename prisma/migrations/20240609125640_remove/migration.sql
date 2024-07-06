/*
  Warnings:

  - You are about to drop the `permisfournis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `permisfournis` DROP FOREIGN KEY `FK_PERMISFO_PERMISFOU_AUTOECOL`;

-- DropTable
DROP TABLE `permisfournis`;
