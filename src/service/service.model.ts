import { Prisma } from '@prisma/client';

export class Service implements Prisma.serviceCreateInput {
    
    nom?: string;
    tarification?: Prisma.tarificationCreateNestedManyWithoutServiceInput;
}
