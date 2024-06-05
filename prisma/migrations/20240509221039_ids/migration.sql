/*
  Warnings:

  - You are about to drop the column `idRole` on the `forfait` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_candidat` on the `forfait` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `forfait` DROP COLUMN `idRole`,
    DROP COLUMN `nombre_candidat`;
