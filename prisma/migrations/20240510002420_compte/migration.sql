-- AlterTable
ALTER TABLE `calendrier` ADD COLUMN `idNotification` INTEGER NULL;

-- CreateIndex
CREATE INDEX `FK_notification` ON `calendrier`(`idNotification`);

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `FK_notification` FOREIGN KEY (`idNotification`) REFERENCES `notification`(`idNotification`) ON DELETE NO ACTION ON UPDATE NO ACTION;
