-- CreateTable
CREATE TABLE `service` (
    `idService` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(254) NULL,

    PRIMARY KEY (`idService`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarification` (
    `idService` INTEGER NOT NULL,
    `idUser` INTEGER NOT NULL,
    `Ger_idUser` INTEGER NOT NULL,
    `tarif` INTEGER NULL,

    INDEX `FK_TARIFICATION_GERANT`(`Ger_idUser`),
    INDEX `FK_TARIFICATION_USER`(`idUser`),
    PRIMARY KEY (`idService`, `idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tarification` ADD CONSTRAINT `FK_TARIFICATION_USER` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tarification` ADD CONSTRAINT `FK_TARIFICATION_GERANT` FOREIGN KEY (`Ger_idUser`) REFERENCES `gerantecole`(`idGerant`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tarification` ADD CONSTRAINT `FK_TARIFICATION_SERVICE` FOREIGN KEY (`idService`) REFERENCES `service`(`idService`) ON DELETE NO ACTION ON UPDATE NO ACTION;
