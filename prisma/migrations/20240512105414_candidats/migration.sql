-- AlterTable
ALTER TABLE `forfait` ADD COLUMN `idGerant` INTEGER NULL;

-- AlterTable
ALTER TABLE `moniteur` ADD COLUMN `statut` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `fk_forfait_gerant_ecole` ON `forfait`(`idGerant`);

-- AddForeignKey
ALTER TABLE `forfait` ADD CONSTRAINT `fk_forfait_gerant_ecole` FOREIGN KEY (`idGerant`) REFERENCES `gerantecole`(`idGerant`) ON DELETE NO ACTION ON UPDATE NO ACTION;
