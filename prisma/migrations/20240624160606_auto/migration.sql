/*
  Warnings:

  - You are about to drop the `cars` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `FK_EVENEMEN_PARTICIPA_VOITURE`;

-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `FK_VOITURE_ETRE_COND_GERANTEC`;

-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `FK_VOITURE_UTILISER_AUTOECOL`;

-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `FK_VOITURE_ETRE_COND_MONITEUR`;

-- DropForeignKey
ALTER TABLE `cars` DROP FOREIGN KEY `cars_ibfk_1`;

-- DropTable
DROP TABLE `cars`;

-- CreateTable
CREATE TABLE `voitures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marque` VARCHAR(255) NULL,
    `modele` VARCHAR(255) NULL,
    `annee` INTEGER NULL,
    `couleur` VARCHAR(100) NULL,
    `idUser` INTEGER NULL,
    `idAutoEcole` INTEGER NULL,
    `statut` VARCHAR(255) NULL,
    `Ger_idUser` INTEGER NULL,
    `date_creation` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `image` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `matricule` VARCHAR(255) NULL,

    INDEX `FK_Ger_idUser`(`Ger_idUser`),
    INDEX `fk_idAutoEcole_cars`(`idAutoEcole`),
    INDEX `idUser`(`idUser`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `FK_EVENEMEN_PARTICIPA_VOITURE` FOREIGN KEY (`idVoiture`) REFERENCES `voitures`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voitures` ADD CONSTRAINT `FK_VOITURE_UTILISER_AUTOECOL` FOREIGN KEY (`idAutoEcole`) REFERENCES `autoecole`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voitures` ADD CONSTRAINT `voitures_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `voitures` ADD CONSTRAINT `FK_VOITURE_ETRE_COND_MONITEUR` FOREIGN KEY (`idUser`) REFERENCES `moniteur`(`idMoniteur`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voitures` ADD CONSTRAINT `FK_VOITURE_ETRE_COND_GERANTEC` FOREIGN KEY (`Ger_idUser`) REFERENCES `gerantecole`(`idGerant`) ON DELETE RESTRICT ON UPDATE RESTRICT;
