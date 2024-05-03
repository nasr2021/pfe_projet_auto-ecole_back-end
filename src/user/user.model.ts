import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";




export class User implements Prisma.userCreateInput {
    idUser: number;
    nom?: string;
    prenom?: string;
    email?: string;
    numero_telephone1?: string;
    numero_telephone2?: string;
    idRole: number;
    nom_entreprise?: string;
    matricule?: string;
    nombre_compte?: number;
    type_paiement?: string;
    paiement_total?: Decimal;
    description?: string;
    horaire_ouverture?: Date;
    horaire_fermeture?: Date;
    nom_ecole?: string;
    nombre_candidat?: number;
    ids_candidats_participes?: string;
    prenom_directeur?: string;
    nom_directeur?: string;
    qualification?: string;
    experience?: number;
    langage?: string;
    success_rating?: number;
    adresse?: string;
    numero_compte?: string;
    registration_number?: string;
    services_offerts?: string;
    voitures_existantes?: string;
    horaires?: string;
    remarque?: string;
    total_paiement?: number;
    total_prise_man?: number;
    idForfaitAchete?: number;
    idCompte?: number;
    idCandidat?: number;
    date_achat_pack?: Date;
    liste_id_compte?: string;
    date_naissance?: Date;
    cin?: string;
    account?: boolean;
    gender?: string;
    job?: string;
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
}

