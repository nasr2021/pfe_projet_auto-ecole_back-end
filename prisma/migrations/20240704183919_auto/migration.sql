/*
  Warnings:

  - You are about to drop the column `experience` on the `autoecole` table. All the data in the column will be lost.
  - You are about to drop the column `heureFermeture` on the `autoecole` table. All the data in the column will be lost.
  - You are about to drop the column `heureOuverture` on the `autoecole` table. All the data in the column will be lost.
  - You are about to drop the column `qualification` on the `autoecole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `autoecole` DROP COLUMN `experience`,
    DROP COLUMN `heureFermeture`,
    DROP COLUMN `heureOuverture`,
    DROP COLUMN `qualification`;
