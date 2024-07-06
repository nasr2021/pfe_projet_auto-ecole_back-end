-- AlterTable
ALTER TABLE `condidat` ADD COLUMN `idPermi` INTEGER NULL;

-- CreateIndex
CREATE INDEX `idPermi` ON `condidat`(`idPermi`);

-- AddForeignKey
ALTER TABLE `condidat` ADD CONSTRAINT `FK_USER_ROLE_PERMI` FOREIGN KEY (`idPermi`) REFERENCES `permi`(`idPermi`) ON DELETE RESTRICT ON UPDATE RESTRICT;
