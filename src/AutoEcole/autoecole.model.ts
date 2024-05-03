import { Prisma, cars, forfait, tarif, user } from "@prisma/client";
import { Forfait } from "src/Pack/pack.model";
import { Tarif } from "src/Tarif/tarif.model";
import { User } from "src/user/user.model";

export class autoecole implements Prisma.autoecoleCreateInput {
    id?: number;
    nom?: string | null;
    adresse?: string | null;
    ville?: string | null;
    code_postal?: string | null;
    pays?: string | null;
    telephone?: string | null;
    email?: string | null;
    idCompteConnecte?: number | null;
    idForfait?: number | null;
    idUser?: number | null;
    sms?: number;
    time_historique?:Date;
    historique?:boolean

}