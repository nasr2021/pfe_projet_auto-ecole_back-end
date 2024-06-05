/*
  Warnings:

  - You are about to drop the column `historique` on the `autoecole` table. All the data in the column will be lost.
  - You are about to drop the column `time_historique` on the `autoecole` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `calendrier` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `calendrier` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `idPack` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `demande` table. All the data in the column will be lost.
  - You are about to drop the column `date_update` on the `forfait` table. All the data in the column will be lost.
  - You are about to drop the column `nom_pack` on the `forfait` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `demande` DROP FOREIGN KEY `demande_ibfk_1`;

-- AlterTable
ALTER TABLE `autoecole` DROP COLUMN `historique`,
    DROP COLUMN `time_historique`,
    ADD COLUMN `temp_historique` DATE NULL;

-- AlterTable
ALTER TABLE `calendrier` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `date_creation` DATE NULL,
    ADD COLUMN `date_modification` DATE NULL;

-- AlterTable
ALTER TABLE `cars` DROP COLUMN `status`,
    ADD COLUMN `statut` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `demande` DROP COLUMN `idPack`,
    DROP COLUMN `status`,
    ADD COLUMN `idForfait` INTEGER NULL,
    ADD COLUMN `statut` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `forfait` DROP COLUMN `date_update`,
    DROP COLUMN `nom_pack`,
    ADD COLUMN `date_modification` DATE NULL,
    ADD COLUMN `nom_forfait` VARCHAR(255) NULL;

-- CreateIndex
CREATE INDEX `idPack` ON `demande`(`idForfait`);

-- AddForeignKey
ALTER TABLE `demande` ADD CONSTRAINT `demande_ibfk_1` FOREIGN KEY (`idForfait`) REFERENCES `forfait`(`idForfait`) ON DELETE NO ACTION ON UPDATE NO ACTION;
