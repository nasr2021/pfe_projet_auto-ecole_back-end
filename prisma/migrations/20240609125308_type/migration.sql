/*
  Warnings:

  - The primary key for the `permisfournis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `idPermi` on the `permisfournis` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `permisfournis` DROP FOREIGN KEY `FK_PERMISFO_PERMISFOU_PERMI`;

-- AlterTable
ALTER TABLE `permisfournis` DROP PRIMARY KEY,
    DROP COLUMN `idPermi`,
    ADD PRIMARY KEY (`idAutoecole`);
