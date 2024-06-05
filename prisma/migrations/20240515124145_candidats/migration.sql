-- CreateIndex
CREATE INDEX `fk_calendrier_moniteur` ON `calendrier`(`idMoniteur`);

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `fk_calendrier_moniteur` FOREIGN KEY (`idMoniteur`) REFERENCES `moniteur`(`idMoniteur`) ON DELETE NO ACTION ON UPDATE NO ACTION;
