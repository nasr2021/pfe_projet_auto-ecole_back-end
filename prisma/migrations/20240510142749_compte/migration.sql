/*
  Warnings:

  - You are about to drop the `condidat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `condidat` DROP FOREIGN KEY `condidat_ibfk_2`;

-- DropForeignKey
ALTER TABLE `condidat` DROP FOREIGN KEY `condidat_ibfk_1`;

-- DropTable
DROP TABLE `condidat`;
