
import { Prisma } from '@prisma/client';


export class Candidat implements Prisma.condidatUncheckedCreateInput {
    idCondidat: number;
    idAutoecole: number;
    nombre_fois_conduit?: number;
    nombre_fois_code?: number;
    autoecole: Prisma.autoecoleCreateNestedOneWithoutCondidatInput;
    user: Prisma.userCreateNestedOneWithoutCondidatInput;
    calendrier?: Prisma.calendrierCreateNestedManyWithoutCondidatInput;
   
}