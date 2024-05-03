import { Prisma } from '@prisma/client';


export class Category implements Prisma.categoryCreateInput {
    idCategory: number;
    nom_categorie: string;

}
