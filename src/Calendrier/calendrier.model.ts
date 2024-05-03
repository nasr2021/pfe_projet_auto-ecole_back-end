import { Prisma } from "@prisma/client";

export class Calendrier implements Prisma.calendrierCreateWithoutCategoryInput {
    idEvenement?: number;
    idCategory: number;
    idUser:number;
    nom_evenement: string;
    date_debut: string | Date;
    date_fin: string | Date;
    description?: string;
    created_at?: string | Date;
    updated_at?: string | Date;
    idCompteConnecte?:number;
    idAutoEcole?:number;
    idMoniteur?:number;
    idCars?:number;
    constructor() {
        
        this.idCategory = 1; 
        this.nom_evenement = '';
        this.date_debut = new Date();
        this.date_fin = new Date();
    }
}
