import { Prisma } from "@prisma/client";
import { Calendrier } from "src/Calendrier/calendrier.model";
import { User } from "src/user/user.model";

export class Cars implements Prisma.carsCreateInput {
    id?: number;
    marque?: string | null;
    modele?: string | null;
    annee?: number | null;
    couleur?: string | null;
    idUser?: number | null;
    idEvenement?: number | null;
    status?:boolean;
    iduserconnecte?:number;
    idAutoEcole?:number;
}