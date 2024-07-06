-- AlterTable
ALTER TABLE `condidat` ADD COLUMN `idContrat` INTEGER NULL;

-- CreateIndex
CREATE INDEX `FK_condidat_contrat` ON `condidat`(`idContrat`);

-- AddForeignKey
ALTER TABLE `condidat` ADD CONSTRAINT `FK_condidat_contrat` FOREIGN KEY (`idContrat`) REFERENCES `contrat`(`idContrat`) ON DELETE SET NULL ON UPDATE RESTRICT;
