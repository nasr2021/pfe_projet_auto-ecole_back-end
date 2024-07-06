-- AlterTable
ALTER TABLE `calendrier` ADD COLUMN `idContrat` INTEGER NULL;

-- CreateIndex
CREATE INDEX `FK_CALENDRIER_CONTRAT` ON `calendrier`(`idContrat`);

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `FK_CALENDRIER_CONTRAT` FOREIGN KEY (`idContrat`) REFERENCES `contrat`(`idContrat`) ON DELETE RESTRICT ON UPDATE RESTRICT;
