/*
  Warnings:

  - Made the column `idCondidat` on table `contrat` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `contrat` DROP FOREIGN KEY `contrat_idCondidat_fkey`;

-- AlterTable
ALTER TABLE `contrat` MODIFY `idCondidat` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `contrat` ADD CONSTRAINT `FK_contrat_condidat` FOREIGN KEY (`idCondidat`) REFERENCES `condidat`(`idCondidat`) ON DELETE RESTRICT ON UPDATE RESTRICT;
