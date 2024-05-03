-- CreateTable
CREATE TABLE `autoecole` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NULL,
    `adresse` VARCHAR(255) NULL,
    `ville` VARCHAR(100) NULL,
    `code_postal` VARCHAR(10) NULL,
    `pays` VARCHAR(100) NULL,
    `telephone` VARCHAR(20) NULL,
    `email` VARCHAR(255) NULL,
    `idCompteConnecte` INTEGER NULL,
    `idForfait` INTEGER NULL,
    `idUser` INTEGER NULL,
    `historique` BOOLEAN NULL,
    `sms` INTEGER NULL,
    `time_historique` DATE NULL,

    INDEX `fk_forfait`(`idForfait`),
    INDEX `fk_user`(`idCompteConnecte`),
    INDEX `fk_user_new_name`(`idUser`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendrier` (
    `idEvenement` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_evenement` VARCHAR(255) NOT NULL,
    `idCategory` INTEGER NOT NULL,
    `date_debut` DATETIME(0) NOT NULL,
    `date_fin` DATETIME(0) NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `idUser` INTEGER NULL,
    `idCompteConnecte` INTEGER NULL,
    `idCars` INTEGER NULL,
    `idAutoEcole` INTEGER NULL,
    `idMoniteur` INTEGER NULL,

    INDEX `fk_calendrier_autoecole`(`idAutoEcole`),
    INDEX `fk_cars_event`(`idCars`),
    INDEX `fk_user_id`(`idUser`),
    INDEX `idCategory`(`idCategory`),
    PRIMARY KEY (`idEvenement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cars` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `marque` VARCHAR(255) NULL,
    `modele` VARCHAR(255) NULL,
    `annee` INTEGER NULL,
    `couleur` VARCHAR(100) NULL,
    `idUser` INTEGER NULL,
    `idEvenement` INTEGER NULL,
    `status` BOOLEAN NULL,
    `idAutoEcole` INTEGER NULL,
    `iduserconnecte` INTEGER NULL,

    INDEX `fk_idAutoEcole_cars`(`idAutoEcole`),
    INDEX `fk_iduserconnecte_cars`(`iduserconnecte`),
    INDEX `idEvenement`(`idEvenement`),
    INDEX `idUser`(`idUser`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category` (
    `idCategory` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_categorie` VARCHAR(45) NOT NULL,

    PRIMARY KEY (`idCategory`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compte` (
    `idCompte` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `idRole` INTEGER NULL,
    `idUser` INTEGER NULL,
    `hash` VARCHAR(191) NOT NULL,
    `hashedRt` VARCHAR(191) NULL,
    `account` BOOLEAN NULL,
    `nom` VARCHAR(191) NULL,
    `number1` VARCHAR(191) NULL,
    `number2` VARCHAR(191) NULL,
    `prenom` VARCHAR(191) NULL,
    `idCompteConnecte` INTEGER NULL,

    UNIQUE INDEX `unique_username`(`username`),
    INDEX `fk_role_compte`(`idRole`),
    INDEX `fk_user_compte_new`(`idUser`),
    PRIMARY KEY (`idCompte`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `demande` (
    `idDemande` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(255) NULL,
    `idPack` INTEGER NULL,
    `status` VARCHAR(255) NULL,
    `idUser` INTEGER NULL,
    `date_creation` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idPack`(`idPack`),
    INDEX `idUser`(`idUser`),
    PRIMARY KEY (`idDemande`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `forfait` (
    `idForfait` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_pack` VARCHAR(255) NOT NULL,
    `nombre_compte` INTEGER NULL,
    `nombre_candidat` INTEGER NULL,
    `nombre_sms` INTEGER NULL,
    `nombre_notification` INTEGER NULL,
    `historique` BOOLEAN NULL,
    `prix` DECIMAL(10, 2) NOT NULL,
    `date_creation` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `date_update` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `idCompteConnecte` INTEGER NULL,
    `idAutoEcole` INTEGER NULL,
    `idRole` INTEGER NULL,
    `idPackCategory` INTEGER NULL,

    INDEX `fk_forfait_autoecole`(`idAutoEcole`),
    INDEX `idPackCategory`(`idPackCategory`),
    PRIMARY KEY (`idForfait`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historique` (
    `idHistorique` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `idCompte` INTEGER NULL,
    `idCalendrier` INTEGER NULL,
    `idCompteConnecte` INTEGER NULL,
    `dateCreation` DATETIME(0) NULL,
    `dateUpdate` DATETIME(0) NULL,
    `description` TEXT NULL,
    `nom` VARCHAR(255) NULL,
    `prenom` VARCHAR(255) NULL,
    `username` VARCHAR(255) NULL,
    `idForfait` INTEGER NULL,

    INDEX `idCalendrier`(`idCalendrier`),
    INDEX `idCompte`(`idCompte`),
    INDEX `idCompteConnecte`(`idCompteConnecte`),
    INDEX `idForfait`(`idForfait`),
    INDEX `userId`(`userId`),
    PRIMARY KEY (`idHistorique`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification` (
    `idNotification` INTEGER NOT NULL AUTO_INCREMENT,
    `lu` BOOLEAN NULL,
    `description` TEXT NULL,
    `date_creation` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `idEvenement` INTEGER NULL,
    `idUser` INTEGER NULL,

    INDEX `idEvenement`(`idEvenement`),
    INDEX `idUser`(`idUser`),
    PRIMARY KEY (`idNotification`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `packcategory` (
    `idPackCategory` INTEGER NOT NULL AUTO_INCREMENT,
    `PackName` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`idPackCategory`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `idRole` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_role` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`idRole`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tarif` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `heure_code` DECIMAL(10, 2) NULL,
    `heure_conduit` DECIMAL(10, 2) NULL,
    `frais_compte` DECIMAL(10, 2) NULL,
    `frais_sms` DECIMAL(10, 2) NULL,
    `frais_moniteur` DECIMAL(10, 2) NULL,
    `frais_historique` DECIMAL(10, 2) NULL,
    `id_autoecole` INTEGER NULL,

    INDEX `fk_autoecole_tarif`(`id_autoecole`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `idUser` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(255) NULL,
    `prenom` VARCHAR(255) NULL,
    `email` VARCHAR(255) NULL,
    `numero_telephone1` VARCHAR(15) NULL,
    `numero_telephone2` VARCHAR(15) NULL,
    `idRole` INTEGER NULL,
    `nom_entreprise` VARCHAR(255) NULL,
    `matricule` VARCHAR(50) NULL,
    `nombre_compte` INTEGER NULL,
    `type_paiement` VARCHAR(50) NULL,
    `paiement_total` DECIMAL(10, 2) NULL,
    `description` TEXT NULL,
    `horaire_ouverture` TIME(0) NULL,
    `horaire_fermeture` TIME(0) NULL,
    `nom_ecole` VARCHAR(255) NULL,
    `nombre_candidat` INTEGER NULL,
    `ids_candidats_participes` TEXT NULL,
    `prenom_directeur` VARCHAR(255) NULL,
    `nom_directeur` VARCHAR(255) NULL,
    `qualification` VARCHAR(255) NULL,
    `experience` INTEGER NULL,
    `langage` VARCHAR(255) NULL,
    `success_rating` INTEGER NULL,
    `adresse` VARCHAR(255) NULL,
    `numero_compte` VARCHAR(20) NULL,
    `registration_number` VARCHAR(20) NULL,
    `services_offerts` TEXT NULL,
    `voitures_existantes` TEXT NULL,
    `horaires` TEXT NULL,
    `remarque` TEXT NULL,
    `total_paiement` INTEGER NULL,
    `total_prise_man` INTEGER NULL,
    `idForfaitAchete` INTEGER NULL,
    `idCompte` INTEGER NULL,
    `idCandidat` INTEGER NULL,
    `date_achat_pack` TIMESTAMP(0) NULL,
    `liste_id_compte` TEXT NULL,
    `date_naissance` DATE NULL,
    `cin` VARCHAR(20) NULL,
    `account` BOOLEAN NULL,
    `gender` VARCHAR(255) NULL,
    `job` VARCHAR(255) NULL,
    `numero_permis` VARCHAR(20) NULL,
    `date_prise_permis` DATE NULL,
    `type_permis_pris` VARCHAR(20) NULL,
    `type_permis_souhaite` VARCHAR(20) NULL,
    `nombre_fois_code` INTEGER NULL,
    `nombre_fois_conduit` INTEGER NULL,
    `nombre_heures_code` INTEGER NULL,
    `nombre_heures_conduit` INTEGER NULL,
    `idCompteConnecte` INTEGER NULL,
    `password` VARCHAR(255) NULL,
    `username` VARCHAR(255) NULL,
    `hash` VARCHAR(255) NULL,
    `hashedRt` VARCHAR(255) NULL,
    `idAutoEcole` INTEGER NULL,
    `activepack` BOOLEAN NULL,

    INDEX `fk_user_autoecole`(`idAutoEcole`),
    INDEX `fk_user_compte`(`idCompte`),
    INDEX `idRole`(`idRole`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `autoecole` ADD CONSTRAINT `fk_forfait` FOREIGN KEY (`idForfait`) REFERENCES `forfait`(`idForfait`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `autoecole` ADD CONSTRAINT `fk_user_new_name` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `fk_calendrier_autoecole` FOREIGN KEY (`idAutoEcole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `fk_cars_event` FOREIGN KEY (`idCars`) REFERENCES `cars`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `category_ibfk_1` FOREIGN KEY (`idCategory`) REFERENCES `category`(`idCategory`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `calendrier` ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `fk_idAutoEcole_cars` FOREIGN KEY (`idAutoEcole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_ibfk_2` FOREIGN KEY (`idEvenement`) REFERENCES `calendrier`(`idEvenement`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `cars_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `cars` ADD CONSTRAINT `fk_iduserconnecte_cars` FOREIGN KEY (`iduserconnecte`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `compte` ADD CONSTRAINT `fk_role_compte` FOREIGN KEY (`idRole`) REFERENCES `roles`(`idRole`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `compte` ADD CONSTRAINT `fk_user_compte_new` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `demande` ADD CONSTRAINT `demande_ibfk_1` FOREIGN KEY (`idPack`) REFERENCES `forfait`(`idForfait`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `demande` ADD CONSTRAINT `demande_ibfk_2` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forfait` ADD CONSTRAINT `fk_forfait_autoecole` FOREIGN KEY (`idAutoEcole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `forfait` ADD CONSTRAINT `forfait_ibfk_1` FOREIGN KEY (`idPackCategory`) REFERENCES `packcategory`(`idPackCategory`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `historique` ADD CONSTRAINT `historique_ibfk_3` FOREIGN KEY (`idCalendrier`) REFERENCES `calendrier`(`idEvenement`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `historique` ADD CONSTRAINT `historique_ibfk_2` FOREIGN KEY (`idCompte`) REFERENCES `compte`(`idCompte`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `historique` ADD CONSTRAINT `historique_ibfk_4` FOREIGN KEY (`idCompteConnecte`) REFERENCES `compte`(`idCompte`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `historique` ADD CONSTRAINT `historique_ibfk_5` FOREIGN KEY (`idForfait`) REFERENCES `forfait`(`idForfait`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `historique` ADD CONSTRAINT `historique_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`idEvenement`) REFERENCES `calendrier`(`idEvenement`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_ibfk_2` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tarif` ADD CONSTRAINT `fk_autoecole_tarif` FOREIGN KEY (`id_autoecole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `fk_user_autoecole` FOREIGN KEY (`idAutoEcole`) REFERENCES `autoecole`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `fk_user_compte` FOREIGN KEY (`idCompte`) REFERENCES `compte`(`idCompte`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`idRole`) REFERENCES `roles`(`idRole`) ON DELETE NO ACTION ON UPDATE NO ACTION;
