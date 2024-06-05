-- CreateTable
CREATE TABLE `permi` (
    `idPermi` INTEGER NOT NULL,
    `idUser` INTEGER NULL,
    `type` VARCHAR(254) NULL,

    PRIMARY KEY (`idPermi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permisfournis` (
    `idAutoecole` INTEGER NOT NULL,
    `idPermi` INTEGER NOT NULL,

    PRIMARY KEY (`idAutoecole`, `idPermi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
