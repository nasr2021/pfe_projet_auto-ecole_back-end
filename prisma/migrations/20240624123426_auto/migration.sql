-- AlterTable
ALTER TABLE `contrat` ADD COLUMN `idCondidat` INTEGER NULL;

-- CreateTable
CREATE TABLE `paiement` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idCondidat` INTEGER NULL,
    `idContrat` INTEGER NULL,
    `incrementType` VARCHAR(255) NULL,
    `incrementValue` INTEGER NULL,
    `date_creation` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `FK_Paiement_ConduitIncrementHistory`(`idCondidat`),
    INDEX `FK_Paiement_ContractIncrementHistory`(`idContrat`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `FK_contrat_condidat` ON `contrat`(`idCondidat`);

-- AddForeignKey
ALTER TABLE `condidat` ADD CONSTRAINT `FK_condidat_CodeIncrementHistory` FOREIGN KEY (`idCondidat`) REFERENCES `paiement`(`idCondidat`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paiement` ADD CONSTRAINT `FK_Paiement_Condidat` FOREIGN KEY (`idCondidat`) REFERENCES `condidat`(`idCondidat`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `paiement` ADD CONSTRAINT `FK_Paiement_ContractIncrementHistory` FOREIGN KEY (`idContrat`) REFERENCES `contrat`(`idContrat`) ON DELETE NO ACTION ON UPDATE NO ACTION;
