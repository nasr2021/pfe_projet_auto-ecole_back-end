import { Prisma } from "@prisma/client";
import { Calendrier } from "src/Calendrier/calendrier.model";
import { User } from "src/user/user.model";

export class Voitures implements Prisma.voituresCreateInput {
    marque?: string;
    modele?: string;
    annee?: number;
    description?: string;
    matricule?: string;
    couleur?: string;
    statut?: string;

    autoecole?: Prisma.autoecoleCreateNestedOneWithoutVoituresInput;
  
    // user_cars_idUserTouser?: Prisma.userCreateNestedOneWithoutVoitures_voitures_idUserTouserInput;
    calendrier?: Prisma.calendrierCreateNestedManyWithoutVoituresInput;
    image?:string;

}