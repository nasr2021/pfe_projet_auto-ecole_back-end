import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";




export class User implements Prisma.userCreateInput {
    otp?: string;
    nom?: string;
    prenom?: string;
    connecte?: number;
    email?: string;
    numero_telephone1?: string;
    numero_telephone2?: string;
    idRole?: number;
    description?: string;
    nombre_candidat?: number;
    ids_candidats_participes?: string;
    qualification?: string;
    experience?: number;
    adresse?: string;
    services_offerts?: string;
    idCompte?: number;
    idCandidat?: number;
    date_naissance?: Date;
    cin?: string;
    compte?: boolean;
    genre?: string;
    emploi?: string;
    numero_permis?: string;
    date_prise_permis?: Date;
    type_permis_pris?: string;
    type_permis_souhaite?: string;
    nombre_fois_code?: number;
    nombre_fois_conduit?: number;
    nombre_heures_code?: number;
    nombre_heures_conduit?: number;
    role?: any;
    idCompteConnecte?:number;
    date_creation?:Date;
    avatar?:string;
}

