import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Tarif } from "./tarif.model";
import { Prisma } from "@prisma/client";

@Injectable()
export class TarifService{
    constructor(private prismaservice:PrismaService){}
    async getTarifsByUserConnecte(userId: number): Promise<Tarif[]> {

        const user = await this.prismaservice.user.findUnique({
            where: {
                idUser: userId
            }
        });

        if (!user || !user.idAutoEcole) {
            throw new Error(`L'utilisateur n'est associé à aucune auto-école.`);
        }

        const autoEcoleId = user.idAutoEcole;


        return this.prismaservice.tarif.findMany({
            where: {
                id_autoecole: autoEcoleId
            }
        });
    }
    async deleteTarifsByUserConnecte(userId: number): Promise<void> {
        
        const user = await this.prismaservice.user.findUnique({
            where: {
                idUser: userId
            }
        });

        if (!user || !user.idAutoEcole) {
            throw new Error(`L'utilisateur n'est associé à aucune auto-école.`);
        }

        const autoEcoleId = user.idAutoEcole;


        await this.prismaservice.tarif.deleteMany({
            where: {
                id_autoecole: autoEcoleId
            }
        });
    }
    async updateOrCreateTarif(data: Tarif, userId: number): Promise<Tarif> {
    
        const user = await this.prismaservice.user.findUnique({
            where: {
                idUser: userId
            }
        });

        if (!user || !user.idAutoEcole) {
            throw new Error(`L'utilisateur n'est associé à aucune auto-école.`);
        }

        const autoEcoleId = user.idAutoEcole;

        
        const existingTarif = await this.prismaservice.tarif.findFirst({
            where: {
                id_autoecole: autoEcoleId
            }
        });

        if (existingTarif) {
            
            return this.prismaservice.tarif.update({
                where: {
                    id: existingTarif.id
                },
                data: {
                    heure_code: data.heure_code,
                    heure_conduit: data.heure_conduit,
                    frais_compte: data.frais_compte,
                    frais_sms: data.frais_sms,
                    frais_moniteur: data.frais_moniteur,
                    frais_historique: data.frais_historique
            
                }
            });
        } else {
            
            const tarifData = { ...data, id_autoecole: autoEcoleId }; 
            return this.prismaservice.tarif.create({
                data: {
                id_autoecole: tarifData.id_autoecole,
                heure_code: tarifData.heure_code,
                heure_conduit: tarifData.heure_conduit,
                frais_compte: tarifData.frais_compte,
                frais_sms: tarifData.frais_sms,
                frais_moniteur: tarifData.frais_moniteur,
                frais_historique: tarifData.frais_historique
                }
            });
        }
    }
    async createTarif(data: Tarif, idUserConnecte: number): Promise<Tarif> {
        
        const idAutoEcole = (await this.prismaservice.user.findUnique({
            where: { idUser: idUserConnecte }
        }))?.idAutoEcole;

        if (!idAutoEcole) {
            throw new Error(`Aucune auto-école associée à l'utilisateur.`);
        }


        const tarifData = { ...data, id_autoecole: idAutoEcole };

        return this.prismaservice.tarif.create({
            data: {
                id_autoecole: tarifData.id_autoecole,
                heure_code: tarifData.heure_code,
                heure_conduit: tarifData.heure_conduit,
                frais_compte: tarifData.frais_compte,
                frais_sms: tarifData.frais_sms,
                frais_moniteur: tarifData.frais_moniteur,
                frais_historique: tarifData.frais_historique
            }
        });
    }
}