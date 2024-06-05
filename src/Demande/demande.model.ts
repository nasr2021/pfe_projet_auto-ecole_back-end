
import { Prisma } from '@prisma/client';


export class Demande implements Prisma.demandeCreateInput {
    type?: string | null
    date_creation?: Date | string | null
    statut?: string | null
  }