import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { Prisma, service, tarification } from "@prisma/client";
import { TarifDto } from "./dto";

import { ServiceDto } from "src/service/dto";
import { Tarif } from "./tarif.model";


@Injectable()
export class TarifService{
   
    constructor(private prisma:PrismaService){}

    async addTarification(
        userId: number,
        serviceName: string,
        tarif: number,role:string
    ): Promise<tarification> {
        try {
           const roles= await this.prisma.roles.findUnique({
            where:{
                idRole: parseInt(role),
            }
           })
           const nom_role= roles.nom_role;
         
            const createdService = await this.prisma.service.create({
                data: {
                    nom: serviceName,
                },
            });

            const serviceId = createdService.idService;
        
            if (nom_role=== 'ecole') {
            const createdTarification = await this.prisma.tarification.create({
                data: {
                    idService: serviceId,
                    idUser: userId,
                    tarif: tarif,
                    Ger_idUser:userId,
                },
            });
    
            return createdTarification;}
            else if (nom_role=== 'manager'){
                const createdTarification = await this.prisma.tarification.create({
                    data: {
                        idService: serviceId,
                        idUser: userId,
                        tarif: tarif,
                    },
                });
        

                return createdTarification; 
            }
        } catch (error) {
            console.error('Erreur lors de la création de la tarification:', error);
            throw error;
        }
    }
    

    async deleteTarification(idService: number, idUser: number): Promise<void> {

        const existingTarification = await this.prisma.tarification.findFirst({
            where: { idService:Number(idService), idUser:Number(idUser) },
        });
        if (!existingTarification) {
            throw new NotFoundException(`Tarification not found for service ID ${idService} and user ID ${idUser}`);
        }

       
        await this.prisma.tarification.delete({
            where: { idService_idUser: {  idService:Number(idService), idUser:Number(idUser) } },
        });
    }
    async updateTarification(idService: number, idUser: number, tarifDto: TarifDto): Promise<tarification> {

        const existingTarification = await this.prisma.tarification.findFirst({
            where: { idService: Number(idService), idUser: Number(idUser) },include: { service: true }, 
        });
        if (!existingTarification) {
            throw new NotFoundException(`Tarification not found for service ID ${idService} and user ID ${idUser}`);
        }

        // Mettre à jour la tarification
        const updatedTarification = await this.prisma.tarification.update({
            where: { idService_idUser: { idService: Number(idService), idUser: Number(idUser) } },
            data: { tarif: tarifDto.tarif ,
          
            },
        });

        return updatedTarification;
    }
    async getAllTarificationsWithServices(userId: number,role:string): Promise<tarification[]> {
        const roles= await this.prisma.roles.findUnique({
            where:{
                idRole: parseInt(role),
            }
           })
           const nom_role= roles.nom_role;
           if(nom_role==='manager'||nom_role==='ecole'){   
             return this.prisma.tarification.findMany({
             include: {
                service: true, 
            }
        });}
   else if(nom_role==='ecole'){   
    return this.prisma.tarification.findMany({
   where: {
       Ger_idUser: userId,
   }, include: {
    service: true 
}
});}
    }
    async getTarificationWithService(idService: number, idUser: number): Promise<tarification> {
        const tarificationWithService = await this.prisma.tarification.findFirst({
            where: {
                idService:Number(idService),
                idUser:Number(idUser)
            },
            include: {
                service: true 
            }
        });

        if (!tarificationWithService) {
            throw new NotFoundException(`Tarification not found for service ID ${idService} and user ID ${idUser}`);
        }

        return tarificationWithService;
    }
}