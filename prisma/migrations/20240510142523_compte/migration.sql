-- CreateTable
CREATE TABLE `moniteur` (
    `idMoniteur` INTEGER NOT NULL,
    `idAutoecole` INTEGER NOT NULL,

    INDEX `idAutoecole`(`idAutoecole`),
    PRIMARY KEY (`idMoniteur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `moniteur` ADD CONSTRAINT `moniteur_ibfk_1` FOREIGN KEY (`idAutoecole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
