
import { Prisma } from '@prisma/client';


export class Forfait implements Prisma.forfaitCreateInput {
    idForfait?: number;
    nom_forfait: string;
    nombre_compte?: number;
    historique?:boolean;
    idCompteConnecte?: number;
    nombre_sms?: number;
    prix: string | number | Prisma.Decimal;
    date_creation?: string | Date;
    date_modification?: string | Date;
    moniteurs?:number;
    idGerant?:number;
}