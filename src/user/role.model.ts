import { Prisma } from "@prisma/client";

export class role implements Prisma.rolesCreateInput {
    idRole: number;
    nom_role: string;

}