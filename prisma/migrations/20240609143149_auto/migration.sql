/*
  Warnings:

  - You are about to drop the column `idContrat` on the `condidat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `idContrat` ON `condidat`;

-- AlterTable
ALTER TABLE `condidat` DROP COLUMN `idContrat`;
