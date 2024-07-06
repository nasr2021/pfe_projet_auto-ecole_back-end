-- DropForeignKey
ALTER TABLE `condidat` DROP FOREIGN KEY `FK_condidat_CodeIncrementHistory`;

-- DropForeignKey
ALTER TABLE `paiement` DROP FOREIGN KEY `FK_Paiement_Condidat`;
