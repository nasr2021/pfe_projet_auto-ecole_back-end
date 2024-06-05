// import { Prisma } from '@prisma/client';

// export class Compte implements Prisma.compteCreateInput {
//   idCompteConnecte?: number;
//   // roles?: Prisma.rolesCreateNestedOneWithoutComptesInput;
//   // historique_historique_idCompteTocompte?: Prisma.historiqueCreateNestedManyWithoutCompte_historique_idCompteTocompteInput;
//   // historique_historique_idCompteConnecteTocompte?: Prisma.historiqueCreateNestedManyWithoutCompte_historique_idCompteConnecteTocompteInput;
//   // user?: Prisma.userCreateNestedManyWithoutCompteInput;
//   idCompte?: number;
//   email: string;
//   username: string;
//   password: string;
//   number1?: string;
//   number2?: string;
//   nom?: string;
//   prenom?:string;
//   account?: boolean;
//   idRole: number | undefined;
//   idUser?: number;
//   user_compte_idUserTouser?: {
//     connect: {
//       idUser: number;
//     };
//   };
//   hash: string;
//   hashedRt?: string | null;
// }