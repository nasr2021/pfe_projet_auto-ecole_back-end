-- AlterTable
ALTER TABLE `autoecole` ADD COLUMN `experience` VARCHAR(254) NULL,
    ADD COLUMN `heureFermeture` INTEGER NULL,
    ADD COLUMN `heureOuverture` DATETIME(0) NULL,
    ADD COLUMN `matricule` VARCHAR(255) NULL,
    ADD COLUMN `qualification` VARCHAR(254) NULL;
