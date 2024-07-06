/*
  Warnings:

  - You are about to drop the column `compte` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `date_naissance` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `date_prise_permis` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `experience` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `idCompteConnecte` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_heures_code` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_heures_conduit` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `numero_permis` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `qualification` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `services_offerts` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `type_permis_pris` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `type_permis_souhaite` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `Ger_idUser` on the `voitures` table. All the data in the column will be lost.
  - You are about to drop the column `idUser` on the `voitures` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `voitures` DROP FOREIGN KEY `FK_VOITURE_ETRE_COND_GERANTEC`;

-- DropForeignKey
ALTER TABLE `voitures` DROP FOREIGN KEY `FK_VOITURE_ETRE_COND_MONITEUR`;

-- DropForeignKey
ALTER TABLE `voitures` DROP FOREIGN KEY `voitures_ibfk_1`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `compte`,
    DROP COLUMN `date_naissance`,
    DROP COLUMN `date_prise_permis`,
    DROP COLUMN `experience`,
    DROP COLUMN `idCompteConnecte`,
    DROP COLUMN `nombre_heures_code`,
    DROP COLUMN `nombre_heures_conduit`,
    DROP COLUMN `numero_permis`,
    DROP COLUMN `qualification`,
    DROP COLUMN `services_offerts`,
    DROP COLUMN `type_permis_pris`,
    DROP COLUMN `type_permis_souhaite`;

-- AlterTable
ALTER TABLE `voitures` DROP COLUMN `Ger_idUser`,
    DROP COLUMN `idUser`;
