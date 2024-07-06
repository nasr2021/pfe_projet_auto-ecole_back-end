/*
  Warnings:

  - You are about to drop the column `date_modification` on the `forfait` table. All the data in the column will be lost.
  - You are about to drop the column `idCompteConnecte` on the `forfait` table. All the data in the column will be lost.
  - You are about to drop the column `statut` on the `moniteur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `forfait` DROP COLUMN `date_modification`,
    DROP COLUMN `idCompteConnecte`;

-- AlterTable
ALTER TABLE `moniteur` DROP COLUMN `statut`;
