-- AlterTable
ALTER TABLE `cars` ADD COLUMN `Ger_idUser` INTEGER NULL;

-- CreateIndex
CREATE INDEX `FK_Ger_idUser` ON `cars`(`Ger_idUser`);

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `FK_Ger_idUser` FOREIGN KEY (`Ger_idUser`) REFERENCES `gerantecole`(`idUser`) ON DELETE RESTRICT ON UPDATE RESTRICT;
