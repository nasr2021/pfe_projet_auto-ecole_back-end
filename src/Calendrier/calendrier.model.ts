import { Prisma } from "@prisma/client";

export class Calendrier implements Prisma.calendrierCreateInput {
    idEvenement?: number;

    idUser?:number;
    nom_evenement: string;
    type?: string;
    date_debut: string | Date;
    date_fin: string | Date;
    description?: string;
    date_creation?: string | Date;
    date_modification?: string | Date;
    idCompteConnecte?:number;
    idAutoEcole?:number;
    idMoniteur?:number;
    idVoiture?:number;
    constructor() {

        this.nom_evenement = '';
        this.date_debut = new Date();
        this.date_fin = new Date();
    }
}
