/*
  Warnings:

  - You are about to drop the column `idPermi` on the `condidat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `condidat` DROP FOREIGN KEY `FK_USER_ROLE_PERMI`;

-- AlterTable
ALTER TABLE `condidat` DROP COLUMN `idPermi`;
