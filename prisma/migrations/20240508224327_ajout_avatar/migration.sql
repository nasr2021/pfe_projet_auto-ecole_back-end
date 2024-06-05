/*
  Warnings:

  - You are about to drop the column `idCars` on the `calendrier` table. All the data in the column will be lost.
  - You are about to drop the column `idCategory` on the `calendrier` table. All the data in the column will be lost.
  - You are about to drop the column `idPackCategory` on the `forfait` table. All the data in the column will be lost.
  - You are about to drop the column `PackName` on the `packcategory` table. All the data in the column will be lost.
  - You are about to drop the column `account` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `job` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `historique` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `fk_cars_event`;

-- DropForeignKey
ALTER TABLE `calendrier` DROP FOREIGN KEY `category_ibfk_1`;

-- DropForeignKey
ALTER TABLE `forfait` DROP FOREIGN KEY `forfait_ibfk_1`;

-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `historique_ibfk_3`;

-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `historique_ibfk_2`;

-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `historique_ibfk_4`;

-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `historique_ibfk_5`;

-- DropForeignKey
ALTER TABLE `historique` DROP FOREIGN KEY `historique_ibfk_1`;

-- AlterTable
ALTER TABLE `calendrier` DROP COLUMN `idCars`,
    DROP COLUMN `idCategory`,
    ADD COLUMN `idCategorie` INTEGER NULL,
    ADD COLUMN `idVoiture` INTEGER NULL;

-- AlterTable
ALTER TABLE `forfait` DROP COLUMN `idPackCategory`,
    ADD COLUMN `idforfaitCategorie` INTEGER NULL;

-- AlterTable
ALTER TABLE `packcategory` DROP COLUMN `PackName`,
    ADD COLUMN `nom_forfait` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `account`,
    DROP COLUMN `gender`,
    DROP COLUMN `job`,
    ADD COLUMN `compte` BOOLEAN NULL,
    ADD COLUMN `emploi` VARCHAR(255) NULL,
    ADD COLUMN `genre` VARCHAR(255) NULL;

-- DropTable
DROP TABLE `historique`;

-- CreateIndex
CREATE INDEX `fk_cars_event` ON `calendrier`(`idVoiture`);

-- CreateIndex
CREATE INDEX `idCategory` ON `calendrier`(`idCategorie`);

-- CreateIndex
CREATE INDEX `idPackCategory` ON `forfait`(`idforfaitCategorie`);

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `fk_cars_event` FOREIGN KEY (`idVoiture`) REFERENCES `cars`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `category_ibfk_1` FOREIGN KEY (`idCategorie`) REFERENCES `category`(`idCategory`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forfait` ADD CONSTRAINT `forfait_ibfk_1` FOREIGN KEY (`idforfaitCategorie`) REFERENCES `packcategory`(`idPackCategory`) ON DELETE NO ACTION ON UPDATE NO ACTION;
