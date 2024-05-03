import { Prisma } from '@prisma/client';
import { autoecole } from 'src/AutoEcole/autoecole.model';

export class Tarif implements Prisma.tarifCreateInput {
    id?: number;
    heure_code?: Prisma.Decimal  | null;
    heure_conduit?: Prisma.Decimal  | null;
    frais_compte?: Prisma.Decimal  | null;
    frais_sms?: Prisma.Decimal  | null;
    frais_moniteur?: Prisma.Decimal  | null;
    frais_historique?: Prisma.Decimal  | null;
    id_autoecole?: number | null;
    autoecole?: { connect?: { id: number } } | null;
}
