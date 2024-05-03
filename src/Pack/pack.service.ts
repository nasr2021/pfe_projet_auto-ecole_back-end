import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Forfait } from "./pack.model";

@Injectable()
export class PackService{
    constructor(private prismaservice:PrismaService){}
    async getAllPack():Promise<Forfait[]>{
        return await this.prismaservice.forfait.findMany()
    }
    // async getPackById(idForfait: number): Promise<Forfait|null> {
    //     return this.prismaservice.forfait.findUnique({ where: { idForfait: Number(idForfait) } });
    // }
    // async createPack(data: any,idCompteConnecte:number): Promise<Forfait> {
    //     const userData = { ...data, idCompteConnecte: idCompteConnecte };
    //     console.log("Forfait créé avec succès:", userData);
    //     userData.nombre_compte = parseInt(userData.nombre_compte, 10);
    //     userData.nombre_candidat = parseInt(userData.nombre_candidat, 10);
    //     userData.nombre_sms = parseInt(userData.nombre_sms, 10);
    //     userData.nombre_notification = parseInt(userData.nombre_notification, 10);
    //     userData.prix = parseFloat(userData.prix);
    //     userData.historique = userData.historique === '1' ? true : false;

    //     return this.prismaservice.forfait.create({
    //         data: userData,
    //     });
    // }


    async createPack(data: any, idCompteConnecte: number): Promise<Forfait> {

        data.nombre_compte = parseInt(data.nombre_compte, 10);
        data.nombre_candidat = parseInt(data.nombre_candidat, 10);
        data.nombre_sms = parseInt(data.nombre_sms, 10);
        data.nombre_notification = parseInt(data.nombre_notification, 10);
        data.prix = parseFloat(data.prix);
        data.historique = data.historique === '1' ? true : false;
    
        
        const user = await this.prismaservice.user.findUnique({
            where: { idUser: idCompteConnecte },
            include: { roles: true }
        });
    
        if (!user || !user.roles) {
            throw new Error(`Impossible de trouver les informations sur l'utilisateur.`);
        }
    
    
        const roleName = user.roles.nom_role;
        const autoecole=user.idAutoEcole;
    
        if (roleName === 'manager') {
            
            if (data.nom_pack !== 'Custom') {
                
                const existingPack = await this.prismaservice.forfait.findFirst({
                    where: { nom_pack: data.nom_pack }
                });
    
                if (existingPack) {
            
                    const updatedPack = await this.prismaservice.forfait.update({
                        where: { idForfait: existingPack.idForfait },
                        data: {
                        
                            ...data,
                            idCompteConnecte: idCompteConnecte
                        }
                    });
    
                    return updatedPack;
                } else {
                    
                    const newPack = await this.prismaservice.forfait.create({
                        data: {
                            
                            ...data,
                            idCompteConnecte: idCompteConnecte
                        }
                    });
    
                    return newPack;
                }
            } else {
                throw new Error(`Les utilisateurs avec le rôle de "manager" ne peuvent pas créer de forfaits pour la catégorie "Custom".`);
            }
        } else if (roleName === 'ecole') {
            
            const newPack = await this.prismaservice.forfait.create({
                data: {
                    ...data,
                    idAutoEcole:autoecole,
                    nom_pack: 'Custom', 
                    idCompteConnecte: idCompteConnecte
                }
            });
    
            
            const newDemande = await this.prismaservice.demande.create({
                data: {
                    
                    idUser: idCompteConnecte,
                    idPack: newPack.idForfait,  
                }
            });
    
            return newPack;
        } else {
            throw new Error(`Seuls les utilisateurs avec le rôle de "manager" ou "ecole" sont autorisés à créer des forfaits.`);
        }
    }
    
    


    // async createPack(data: any, idCompteConnecte: number): Promise<Forfait> {
    //     // Convertir les données numériques en entiers et décimaux
    //     data.nombre_compte = parseInt(data.nombre_compte, 10);
    //     data.nombre_candidat = parseInt(data.nombre_candidat, 10);
    //     data.nombre_sms = parseInt(data.nombre_sms, 10);
    //     data.nombre_notification = parseInt(data.nombre_notification, 10);
    //     const categoryId = parseInt(data.idCategory, 10);
    //     // Récupérer le nom de la catégorie à partir de son ID
    //     const category = await this.prismaservice.packcategory.findUnique({
    //         where: { idPackCategory: categoryId }
    //     });
    
    //     if (!category) {
    //         throw new Error(`La catégorie de pack avec l'ID ${data.idCategory} n'existe pas.`);
    //     }
    
    //     // Vérifier si la catégorie est "Custom"
    //     if (category.PackName === 'Custom') {
    //         const user = await this.prismaservice.user.findUnique({
    //             where: { idUser: idCompteConnecte }
    //         });
    
    //         if (!user || !user.idAutoEcole) {
    //             throw new Error(`Aucune auto-école associée à cet utilisateur.`);
    //         }
    
    //         const autoEcoleId = user.idAutoEcole;
    
    //         // Récupérer les tarifs de l'auto-école de l'utilisateur connecté
    //         const tarifs = await this.prismaservice.tarif.findMany({
    //             where: { id_autoecole: autoEcoleId }
    //         });
    
    //         if (data.nombre_sms && tarifs[0] && typeof data.nombre_sms === 'number' && typeof tarifs[0].frais_sms === 'number') {
    //             data.prix += data.nombre_sms * tarifs[0].frais_sms; // Assurez-vous que les valeurs sont des nombres
    //         }
    
    //         // Créer le pack
    //         const pack = await this.prismaservice.forfait.create({
    //             data: {
    //                 ...data,
    //                 prix :parseFloat(data.prix),
    //                 idCompteConnecte: idCompteConnecte,
    //                 historique: data.historique === '1' ? true : false
    //             }
    //         });
    
    //         // Créer la demande correspondante
    //         await this.prismaservice.demande.create({
    //             data: {
    //                 idUser: idCompteConnecte,
    //                 idPack: pack.idForfait, // Utiliser l'ID du pack nouvellement créé comme description
    //                 // Utiliser le nom du pack comme description
    //             }
    //         });
    
    //         return pack;
    //     } else {
    //         // Vérifier si un pack existe déjà avec le même nom de catégorie
    //         const existingPack = await this.prismaservice.forfait.findFirst({
    //             where: { nom_pack: category.PackName }
    //         });
    
    //         if (existingPack) {
    //             // Mettre à jour le forfait existant
    //             const updatedPack = await this.prismaservice.forfait.update({
    //                 where: { idForfait: existingPack.idForfait },
    //                 data: {
    //                     ...data,
    //                     prix :parseFloat(data.prix),
    //                     idCompteConnecte: idCompteConnecte,
    //                     historique: data.historique === '1' ? true : false
    //                 }
    //             });
    
    //             return updatedPack;
    //         } else {
    //             // Créer un nouveau pack si aucun pack existant avec ce nom de catégorie
    //             console.log("Forfait créé avec succès:", data);
    //             return this.prismaservice.forfait.create({
    //                 data: {
    //                     ...data,
    //                     prix :parseFloat(data.prix),
    //                     idCompteConnecte: idCompteConnecte,
    //                     historique: data.historique === '1' ? true : false
    //                 }
    //             });
    //         }
    //     }
    // }
    
//     async createPack(data: any, idCompteConnecte: number): Promise<Forfait> {
//         // Convertir les données numériques en entiers et décimaux
//         data.nombre_compte = parseInt(data.nombre_compte, 10);
//         data.nombre_candidat = parseInt(data.nombre_candidat, 10);
//         data.nombre_sms = parseInt(data.nombre_sms, 10);
//         data.nombre_notification = parseInt(data.nombre_notification, 10);
       
//         const user = await this.prismaservice.user.findUnique({
//             where: { idUser: idCompteConnecte }
//           });
        
//           if (!user || !user.idAutoEcole) {
//             throw new Error(`Aucune auto-école associée à cet utilisateur.`);
//           }
//           const autoEcoleId = user.idAutoEcole;
//   // Récupérer les tarifs de l'auto-école de l'utilisateur connecté
//   const tarifs = await this.prismaservice.tarif.findMany({
//     where: { id_autoecole: autoEcoleId }
//   });
//         // Récupérer le nom de la catégorie à partir de son ID
//         const category = await this.prismaservice.packcategory.findUnique({
//           where: { idPackCategory: data.idCategory }
//         });
      
//         if (!category) {
//           throw new Error(`La catégorie de pack avec l'ID ${data.idCategory} n'existe pas.`);
//         }
      
//         // Vérifier si la catégorie est "Custom"
//         if (category.PackName === 'Custom') {
//             if (data.nombre_sms && tarifs[0] && typeof data.nombre_sms === 'number' && typeof tarifs[0].frais_sms === 'number') {
//                 data.prix += data.nombre_sms * tarifs[0].frais_sms; // Assurez-vous que les valeurs sont des nombres
//             }
//           // Créer le pack
//           const pack = await this.prismaservice.forfait.create({
//             data: {
//               ...data,
//               prix :parseFloat(data.prix),
//               idCompteConnecte: idCompteConnecte,
//               historique: data.historique === '1' ? true : false
//             }
//           });
      
//           // Créer la demande correspondante
//           await this.prismaservice.demande.create({
//             data: {
//               idUser: idCompteConnecte,
//               idPack: pack.idForfait, // Utiliser l'ID du pack nouvellement créé comme description
//               // Utiliser le nom du pack comme description
//             }
//           });
      
//           return pack;
//         } else {
//             // Vérifier si un pack existe déjà avec le même nom de catégorie
//             const existingPack = await this.prismaservice.forfait.findFirst({
//                 where: { nom_pack: category.PackName }
//             });
    
//             if (existingPack) {
//                 // Mettre à jour le forfait existant
//                 const updatedPack = await this.prismaservice.forfait.update({
//                     where: { idForfait: existingPack.idForfait },
//                     data: {
//                         ...data,
//                         prix :parseFloat(data.prix),
//                         idCompteConnecte: idCompteConnecte,
//                         historique: data.historique === '1' ? true : false
//                     }
//                 });
    
//                 return updatedPack;
//             } else {
//                 // Créer un nouveau pack si aucun pack existant avec ce nom de catégorie
//                 console.log("Forfait créé avec succès:", data);
//                 return this.prismaservice.forfait.create({
//                     data: {
//                         ...data,
//                         prix :parseFloat(data.prix),
//                         idCompteConnecte: idCompteConnecte,
//                         historique: data.historique === '1' ? true : false
//                     }
//                 });
//             }
//         }
//     }
      
    async updatePack(idForfait: number, data: Forfait): Promise<Forfait> {
        return this.prismaservice.forfait.update({
            where: { idForfait: Number(idForfait) },
            data: {
                ...data,
                
                nombre_compte: Number(data.nombre_compte),
                nombre_candidat: Number(data.nombre_candidat),
                nombre_sms: Number(data.nombre_sms),
                nombre_notification: Number(data.nombre_notification),
                prix: Number(data.prix),
            
                historique: !!data.historique
            }
        });
    }
    
    async deletePack(idForfait:number):Promise<Forfait>{
        return this.prismaservice.forfait.delete({
            where:{idForfait:Number(idForfait)}
        })
    }
    async getAllPacksByMoniteur(idUser: number): Promise<Forfait[]> {
        
        const moniteur = await this.prismaservice.user.findUnique({
            where: {
                idUser: idUser,
            },
            include: {
                roles: true,
            },
        });

        if (!moniteur || moniteur.roles?.nom_role !== 'ecole') {
            throw new NotFoundException(`L'utilisateur avec l'ID ${idUser} n'est pas un ecole.`);
        }

    
        const idAutoEcole = moniteur.idAutoEcole;

        
        const packs = await this.prismaservice.forfait.findMany({
            where: {
                idAutoEcole: idAutoEcole,
            },
        });

        return packs;
    }
    async getAllPacksCustom(): Promise<Forfait[]> {
        return await this.prismaservice.forfait.findMany({
            where: {
                nom_pack: 'custom',
            },
        });
    }
    async getAllPacksExceptCustom(): Promise<Forfait[]> {
        return await this.prismaservice.forfait.findMany({
            where: {
                NOT: {
                    nom_pack: 'custom',
                },
            },
        });
    }
    async acheterPack(packId: number, userId: number): Promise<void> {
    
        const pack = await this.prismaservice.forfait.findUnique({
            where: {
                idForfait: packId,
            },
        });

        if (!pack) {
            throw new NotFoundException(`Le pack avec l'ID ${packId} n'existe pas.`);
        }

    
        await this.prismaservice.demande.create({
            data: {
                type: "demande_achat",
                idPack: packId,
                status: "en_attente",
                idUser: userId,
            },
        });
    }
    async accepterDemandePack(demandeId: number): Promise<void> {
    
        const demande = await this.prismaservice.demande.findUnique({
            where: { idDemande: Number(demandeId) },
            include: { forfait: true } 
        });
    
        if (!demande) {
            throw new NotFoundException(`La demande avec l'ID ${demandeId} n'existe pas.`);
        }
    
        
        const user = await this.prismaservice.user.findUnique({
            where: { idUser: Number(demande.idUser) }
        });
    
        if (!user || !user.idAutoEcole) {
            throw new NotFoundException(`Aucune auto-école associée à l'utilisateur.`);
        }
    
        const idAutoEcole = user.idAutoEcole;
    
        console.log('ID de l\'auto-école associée à l\'utilisateur :', idAutoEcole);
        const autoEcole = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(idAutoEcole) },
            select: { sms: true }
        });
        if (!autoEcole) {
            throw new NotFoundException(`Auto-école non trouvée.`);
        }
        const nouveauNombreSms = autoEcole.sms + demande.forfait.nombre_sms;
        console.log("nouveauNombreSms",nouveauNombreSms)
    
        await this.prismaservice.autoecole.update({
            where: { id: Number(idAutoEcole) },
            data: {
                sms: nouveauNombreSms
             }
        });
        const autoEcoleApres = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(idAutoEcole) }
        });
        console.log('Auto-école après la mise à jour :', autoEcoleApres);
        
        await this.prismaservice.demande.update({
            where: { idDemande: Number(demandeId) },
            data: { status: 'acceptée' }
        });
    }
    

}