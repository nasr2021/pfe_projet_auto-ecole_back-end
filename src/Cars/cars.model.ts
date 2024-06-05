import { Prisma } from "@prisma/client";
import { Calendrier } from "src/Calendrier/calendrier.model";
import { User } from "src/user/user.model";

export class Cars implements Prisma.carsCreateInput {
    marque?: string;
    modele?: string;
    annee?: number;
    couleur?: string;
    statut?: string;
    gerantecole?: Prisma.gerantecoleCreateNestedOneWithoutCarsInput;
    autoecole?: Prisma.autoecoleCreateNestedOneWithoutCarsInput;
    moniteur?: Prisma.moniteurCreateNestedOneWithoutCarsInput;
    user_cars_idUserTouser?: Prisma.userCreateNestedOneWithoutCars_cars_idUserTouserInput;
    calendrier?: Prisma.calendrierCreateNestedManyWithoutCarsInput;
    image?:string;

}