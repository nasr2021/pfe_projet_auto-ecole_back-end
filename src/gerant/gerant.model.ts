import { Prisma } from '@prisma/client';

export class Gerant implements Prisma.gerantecoleCreateInput {
    idGerant: number;
    autoecole?: Prisma.autoecoleCreateNestedManyWithoutGerantecoleInput;
 
}
