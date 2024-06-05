-- AlterTable
ALTER TABLE `demande` ADD COLUMN `idAutoecole` INTEGER NULL,
    ADD COLUMN `idNotification` INTEGER NULL;

-- CreateIndex
CREATE INDEX `fk_demande_autoecole` ON `demande`(`idAutoecole`);

-- CreateIndex
CREATE INDEX `fk_demande_notification` ON `demande`(`idNotification`);

-- AddForeignKey
ALTER TABLE `demande` ADD CONSTRAINT `fk_demande_autoecole` FOREIGN KEY (`idAutoecole`) REFERENCES `autoecole`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demande` ADD CONSTRAINT `fk_demande_notification` FOREIGN KEY (`idNotification`) REFERENCES `notification`(`idNotification`) ON DELETE CASCADE ON UPDATE CASCADE;
