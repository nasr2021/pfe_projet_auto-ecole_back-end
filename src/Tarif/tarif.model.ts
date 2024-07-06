import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';


export class Tarif implements Prisma.tarificationCreateInput {
    tarif?: Decimal;
    gerantecole?: Prisma.gerantecoleCreateNestedOneWithoutTarificationInput;

    // gerantecole: Prisma.gerantecoleCreateNestedOneWithoutTarificationInput;
    service: Prisma.serviceCreateNestedOneWithoutTarificationInput;
    user: Prisma.userCreateNestedOneWithoutTarificationInput; 
}
