import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Forfait } from "./pack.model";

@Injectable()
export class PackService{
    constructor(private prismaservice:PrismaService){}
    async getAllPack():Promise<Forfait[]>{
        return await this.prismaservice.forfait.findMany({
            where: {
                nom_forfait: {
                    not: "custom"
                }
            }
        })
    }
    async getForfaitById(forfaitId: number): Promise<Forfait> {
        const forfait = await this.prismaservice.forfait.findUnique({
            where: { idForfait: Number(forfaitId) },
        });

        if (!forfait) {
            throw new NotFoundException(`Forfait with ID ${forfaitId} not found`);
        }

        return forfait;
    }


    async createOrUpdateForfait(packDto: Forfait): Promise<Forfait> {
        
        const existingPack = await this.prismaservice.forfait.findFirst({
            where: { nom_forfait: packDto.nom_forfait },
        });
        const currentDate = new Date();
        
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        if (existingPack) {
        
            console.log("Existing pack found:", existingPack);
            const updatedPack = await this.prismaservice.forfait.update({
                where: { idForfait: Number(existingPack.idForfait) },
                data: { ...packDto, date_creation: currentDate }
            });
            console.log("Updated pack:", updatedPack);
            return updatedPack;
        } else {
        
            console.log("Creating new pack...");
            const createdPack = await this.prismaservice.forfait.create({
                data: { ...packDto, date_creation: currentDate }
            });
            console.log("New pack created:", createdPack);
            return createdPack;
        }
    }

    async deleteForfait(forfaitId: number): Promise<void> {
        
        const existingForfait = await this.prismaservice.forfait.findUnique({
            where: { idForfait: Number(forfaitId) },
        });

        if (!existingForfait) {
            throw new NotFoundException(`Forfait with ID ${forfaitId} not found`);
        }

        await this.prismaservice.forfait.delete({
            where: { idForfait: Number(forfaitId) },
        });
    }

    
    async createCustomForfait(forfaitData: Forfait,userid:number):Promise<Forfait> {
        const service =  await this.prismaservice.tarification.findMany({
            include: {
               service: true, 
           }
       });
        const userAutoEcole = await this.prismaservice.gerantecole.findFirst({
            where: {
                idGerant: Number(userid),
            },
            select: {
                autoecole: true,
            },
        });
    
        if (!userAutoEcole || !userAutoEcole.autoecole[0].id) {
            throw new NotFoundException(`L'utilisateur avec l'ID ${userid} n'est pas associé à une auto-école.`);
        }
        const currentDate = new Date();
        let totalCost = 0;
      
        service.forEach((service) => {
            if (service.service.nom === 'sms' && forfaitData.nombre_sms) {
              totalCost += service.tarif * forfaitData.nombre_sms;
              console.log(' forfaitData.nombre_sms',  forfaitData.nombre_sms)
              console.log('service.tarif.sms', service.tarif)
            } else if (service.service.nom === 'moniteur' && forfaitData.nombre_compte) {
              totalCost += service.tarif * forfaitData.nombre_compte;
              console.log('service.tarif.moniteur', service.tarif)
              console.log('forfaitData.nombre_compte', forfaitData.nombre_compte)
            }
            else if (service.service.nom === 'historique') {
          
                console.log('service.tarif.historique', service.tarif)
                if (forfaitData.historique== true) {
                    totalCost += service.tarif;
                    console.log('totalCost historique true', totalCost)
                  }
                  else{

                    totalCost += 0 ;
                    console.log('totalCost historique false', totalCost)
              }
              }
          });
          
    const custom=await this.prismaservice.forfait.create({
        data:{
            ...forfaitData,
            idAutoEcole:Number(userAutoEcole.autoecole[0].id),
            idGerant:Number(userid),
            nom_forfait: "custom", 
            date_creation: currentDate,
            prix: Number(totalCost)
        }
    });
    await this.prismaservice.demande.create({
        data: {
            type: "demande_achat_custom_forfait",
            idForfait: Number(custom.idForfait),
            statut: "en_attente",
            idUser: Number(userid),
            idAutoecole: userAutoEcole.autoecole[0].id,
            date_creation: currentDate,
        },
    });
if(forfaitData.historique== true){
    const currentTempHistorique = await this.prismaservice.autoecole.findFirst({
        where: {
          id: Number(userAutoEcole.autoecole[0].id),
        },
        select: {
          temp_historique: true,
        },
      });
      const newTempHistorique = new Date(currentTempHistorique.temp_historique);
      newTempHistorique.setFullYear(newTempHistorique.getFullYear() + 1); // Ajouter 1 an
      const updatedAutoEcole = await this.prismaservice.autoecole.update({
        where: {
          id: Number(userAutoEcole.autoecole[0].id),
        },
        data: {
          temp_historique: newTempHistorique,
        },
      });  
}
        return custom;
    }
    async acheterPack(packId: number, userId: number): Promise<void> {
    
        const pack = await this.prismaservice.forfait.findUnique({
            where: {
                idForfait: Number(packId),
            },
        });

        if (!pack) {
            throw new NotFoundException(`Le pack avec l'ID ${packId} n'existe pas.`);
        }

        const userAutoEcole = await this.prismaservice.gerantecole.findFirst({
            where: {
                idGerant: Number(userId),
            },
            select: {
                autoecole: true,
            },
        });
    
        if (!userAutoEcole || !userAutoEcole.autoecole[0].id) {
            throw new NotFoundException(`L'utilisateur avec l'ID ${userId} n'est pas associé à une auto-école.`);
        }
        const currentDate = new Date();           
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');
const hours = String(currentDate.getHours()).padStart(2, '0');
const minutes = String(currentDate.getMinutes()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
 
        await this.prismaservice.demande.create({
            data: {
                type: "demande_achat",
                idForfait: Number(packId),
                statut: "en_attente",
                idUser: Number(userId),
                idAutoecole: userAutoEcole.autoecole[0].id,
                date_creation:currentDate
            },
        });
    }
    async accepterDemandePack(demandeId: number): Promise<void> {
        const currentDate = new Date();       

 
        const demande = await this.prismaservice.demande.findUnique({
            where: { idDemande: Number(demandeId) },
            include: { forfait: true } 
        });
    
        if (!demande) {
            throw new NotFoundException(`La demande avec l'ID ${demandeId} n'existe pas.`);
        }
    
        const demandeecole = demande.idAutoecole
        
    
        console.log('ID de l\'auto-école  :', demandeecole);
        const autoEcole = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(demandeecole) }
        });
        if (!autoEcole) {
            throw new NotFoundException(`Auto-école non trouvée.`);
        }
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      
        const nouveauNombreSms = autoEcole.sms + demande.forfait.nombre_sms;
        const nouveauNombrecompte = autoEcole.sms + demande.forfait.nombre_compte;
        console.log("nouveauNombreSms",nouveauNombreSms)
    
        await this.prismaservice.autoecole.update({
            where: { id: Number(demandeecole) },
            data: {
                sms: nouveauNombreSms,
                moniteurs:nouveauNombrecompte,
                temp_historique: currentDate
             }
        });
        const autoEcoleApres = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(demandeecole) }
        });
        console.log('Auto-école après la mise à jour :', autoEcoleApres);
        
        await this.prismaservice.demande.update({
            where: { idDemande: Number(demandeId) },
            data: { statut: 'acceptée' }
        });
    }
    
    async refuserDemandePack(demandeId: number): Promise<void> {
        const currentDate = new Date();       

 
        const demande = await this.prismaservice.demande.findUnique({
            where: { idDemande: Number(demandeId) },
            include: { forfait: true } 
        });
    
        if (!demande) {
            throw new NotFoundException(`La demande avec l'ID ${demandeId} n'existe pas.`);
        }
    
        const demandeecole = demande.idAutoecole
        
    
        console.log('ID de l\'auto-école  :', demandeecole);
        const autoEcole = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(demandeecole) }
        });
        if (!autoEcole) {
            throw new NotFoundException(`Auto-école non trouvée.`);
        }
        const nouveauNombreSms = autoEcole.sms + demande.forfait.nombre_sms;
        const nouveauNombrecompte = autoEcole.sms + demande.forfait.nombre_compte;
        console.log("nouveauNombreSms",nouveauNombreSms)
    
        await this.prismaservice.autoecole.update({
            where: { id: Number(demandeecole) },
            data: {
                sms: nouveauNombreSms,
                moniteurs:nouveauNombrecompte
             }
        });
        const autoEcoleApres = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(demandeecole) }
        });
        console.log('Auto-école après la mise à jour :', autoEcoleApres);
        
        await this.prismaservice.demande.update({
            where: { idDemande: Number(demandeId) },
            data: { statut: 'refusé' }
        });
    }
}