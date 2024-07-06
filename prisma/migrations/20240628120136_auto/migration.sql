/*
  Warnings:

  - You are about to alter the column `tarif` on the `tarification` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.

*/
-- DropIndex
DROP INDEX `FK_Paiement_ConduitIncrementHistory` ON `paiement`;

-- AlterTable
ALTER TABLE `tarification` MODIFY `tarif` DECIMAL(65, 30) NULL;
