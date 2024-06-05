/*
  Warnings:

  - You are about to drop the column `idCandidat` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `idCompte` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `idForfaitAchete` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `ids_candidats_participes` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `compte` DROP FOREIGN KEY `fk_user_compte_new`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `fk_user_compte`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `idCandidat`,
    DROP COLUMN `idCompte`,
    DROP COLUMN `idForfaitAchete`,
    DROP COLUMN `ids_candidats_participes`;

-- CreateTable
CREATE TABLE `service` (
    `idService` INTEGER NOT NULL,
    `nom` VARCHAR(254) NULL,

    PRIMARY KEY (`idService`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
