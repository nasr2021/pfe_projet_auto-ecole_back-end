-- CreateTable
CREATE TABLE `moniteur` (
    `idUser` INTEGER NOT NULL,
    `idAutoecole` INTEGER NOT NULL,

    INDEX `idAutoecole`(`idAutoecole`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `condidat` (
    `idUser` INTEGER NOT NULL,
    `idAutoecole` INTEGER NOT NULL,
    `nombre_fois_conduit` INTEGER NULL,
    `nombre_fois_code` INTEGER NULL,

    INDEX `idAutoecole`(`idAutoecole`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gerantecole` (
    `idUser` INTEGER NOT NULL,
    `idAutoecole` INTEGER NULL,

    INDEX `idAutoecole`(`idAutoecole`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarification` (
    `idUser` INTEGER NOT NULL,
    `idService` INTEGER NOT NULL,
    `Ger_idUser` INTEGER NOT NULL,
    `tarif` INTEGER NULL,

    INDEX `Ger_idUser`(`Ger_idUser`),
    INDEX `idService`(`idService`),
    PRIMARY KEY (`idUser`, `idService`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `moniteur` ADD CONSTRAINT `moniteur_ibfk_2` FOREIGN KEY (`idAutoecole`) REFERENCES `autoecole`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `moniteur` ADD CONSTRAINT `moniteur_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `condidat` ADD CONSTRAINT `condidat_ibfk_2` FOREIGN KEY (`idAutoecole`) REFERENCES `autoecole`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `condidat` ADD CONSTRAINT `condidat_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `gerantecole` ADD CONSTRAINT `gerantecole_ibfk_2` FOREIGN KEY (`idAutoecole`) REFERENCES `autoecole`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `gerantecole` ADD CONSTRAINT `gerantecole_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarification` ADD CONSTRAINT `tarification_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarification` ADD CONSTRAINT `tarification_ibfk_2` FOREIGN KEY (`idService`) REFERENCES `service`(`idService`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tarification` ADD CONSTRAINT `tarification_ibfk_3` FOREIGN KEY (`Ger_idUser`) REFERENCES `gerantecole`(`idUser`) ON DELETE RESTRICT ON UPDATE RESTRICT;
