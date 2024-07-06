-- AlterTable
ALTER TABLE `permi` ADD COLUMN `idUser` INTEGER NULL;

-- CreateIndex
CREATE INDEX `FK_permi_condidat` ON `permi`(`idUser`);

-- AddForeignKey
ALTER TABLE `permi` ADD CONSTRAINT `FK_permi_condidat` FOREIGN KEY (`idUser`) REFERENCES `condidat`(`idCondidat`) ON DELETE RESTRICT ON UPDATE RESTRICT;
