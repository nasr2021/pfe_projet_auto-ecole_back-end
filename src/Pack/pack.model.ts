
import { Prisma } from '@prisma/client';


export class Forfait implements Prisma.forfaitCreateInput {
    idForfait:number;
    nom_pack: string;
    nombre_compte?: number;
    idCompteConnecte?:number;
    nombre_candidat?: number;
    nombre_sms?: number;
    nombre_notification?: number;
    historique?: boolean;
    prix: string | number | Prisma.Decimal;
    date_creation?: string | Date;
    date_update?: string | Date;
}