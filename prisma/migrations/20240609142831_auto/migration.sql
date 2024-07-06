-- AlterTable
ALTER TABLE `condidat` ADD COLUMN `idContrat` INTEGER NULL;

-- CreateIndex
CREATE INDEX `idContrat` ON `condidat`(`idContrat`);
