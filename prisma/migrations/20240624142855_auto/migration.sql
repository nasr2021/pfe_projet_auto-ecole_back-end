/*
  Warnings:

  - You are about to drop the column `idContrat` on the `condidat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `condidat` DROP FOREIGN KEY `FK_condidat_contrat`;

-- AlterTable
ALTER TABLE `condidat` DROP COLUMN `idContrat`;

-- AddForeignKey
ALTER TABLE `contrat` ADD CONSTRAINT `contrat_idCondidat_fkey` FOREIGN KEY (`idCondidat`) REFERENCES `condidat`(`idCondidat`) ON DELETE SET NULL ON UPDATE CASCADE;
