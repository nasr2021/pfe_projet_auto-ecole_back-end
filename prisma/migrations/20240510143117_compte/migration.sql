-- CreateTable
CREATE TABLE `condidat` (
    `idCondidat` INTEGER NOT NULL,
    `idAutoecole` INTEGER NOT NULL,
    `nombre_fois_conduit` INTEGER NULL,
    `nombre_fois_code` INTEGER NULL,

    INDEX `idAutoecole`(`idAutoecole`),
    PRIMARY KEY (`idCondidat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `condidat` ADD CONSTRAINT `condidat_ibfk_1` FOREIGN KEY (`idAutoecole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
