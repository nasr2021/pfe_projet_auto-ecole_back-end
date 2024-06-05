/*
  Warnings:

  - You are about to drop the column `nombre_notification` on the `forfait` table. All the data in the column will be lost.
  - You are about to drop the column `frais_compte` on the `tarif` table. All the data in the column will be lost.
  - You are about to drop the column `frais_historique` on the `tarif` table. All the data in the column will be lost.
  - You are about to drop the column `frais_moniteur` on the `tarif` table. All the data in the column will be lost.
  - You are about to drop the column `frais_sms` on the `tarif` table. All the data in the column will be lost.
  - You are about to drop the column `heure_code` on the `tarif` table. All the data in the column will be lost.
  - You are about to drop the column `heure_conduit` on the `tarif` table. All the data in the column will be lost.
  - You are about to drop the column `activepack` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `date_achat_pack` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `horaire_fermeture` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `horaire_ouverture` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `horaires` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `langage` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `liste_id_compte` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `matricule` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nom_directeur` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nom_ecole` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nom_entreprise` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_candidat` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_compte` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `numero_compte` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `paiement_total` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `prenom_directeur` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `registration_number` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `remarque` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `success_rating` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `total_paiement` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `total_prise_man` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `type_paiement` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `voitures_existantes` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `forfait` DROP COLUMN `nombre_notification`;

-- AlterTable
ALTER TABLE `tarif` DROP COLUMN `frais_compte`,
    DROP COLUMN `frais_historique`,
    DROP COLUMN `frais_moniteur`,
    DROP COLUMN `frais_sms`,
    DROP COLUMN `heure_code`,
    DROP COLUMN `heure_conduit`;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `activepack`,
    DROP COLUMN `date_achat_pack`,
    DROP COLUMN `horaire_fermeture`,
    DROP COLUMN `horaire_ouverture`,
    DROP COLUMN `horaires`,
    DROP COLUMN `langage`,
    DROP COLUMN `liste_id_compte`,
    DROP COLUMN `matricule`,
    DROP COLUMN `nom_directeur`,
    DROP COLUMN `nom_ecole`,
    DROP COLUMN `nom_entreprise`,
    DROP COLUMN `nombre_candidat`,
    DROP COLUMN `nombre_compte`,
    DROP COLUMN `numero_compte`,
    DROP COLUMN `paiement_total`,
    DROP COLUMN `prenom_directeur`,
    DROP COLUMN `registration_number`,
    DROP COLUMN `remarque`,
    DROP COLUMN `success_rating`,
    DROP COLUMN `total_paiement`,
    DROP COLUMN `total_prise_man`,
    DROP COLUMN `type_paiement`,
    DROP COLUMN `voitures_existantes`;
