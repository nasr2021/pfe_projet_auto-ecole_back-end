import { Prisma } from "@prisma/client";
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
    temp_historique?:Date;
    experience?: string | null;
    heureFermeture?: number | null;
    heureOuverture?: Date | string | null;
    matricule?: string | null;
    qualification?: string | null;
    candidats?:number|null;
    date_creation?:Date;
    status?:string;
   }