import { Prisma } from '@prisma/client';


export class Tarif implements Prisma.tarificationCreateInput {
    tarif?: number;
    gerantecole?: Prisma.gerantecoleCreateNestedOneWithoutTarificationInput;

    // gerantecole: Prisma.gerantecoleCreateNestedOneWithoutTarificationInput;
    service: Prisma.serviceCreateNestedOneWithoutTarificationInput;
    user: Prisma.userCreateNestedOneWithoutTarificationInput; 
}
