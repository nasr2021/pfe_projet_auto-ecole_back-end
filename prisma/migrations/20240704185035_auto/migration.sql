/*
  Warnings:

  - You are about to drop the column `nombre_fois_code` on the `condidat` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_fois_conduit` on the `condidat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `condidat` DROP COLUMN `nombre_fois_code`,
    DROP COLUMN `nombre_fois_conduit`;
