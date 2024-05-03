import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { autoecole } from "./autoecole.model";
import { User } from "../user/user.model"; 

@Injectable()
export class AutoEcoleService {
  constructor(private prismaService: PrismaService) {}
  async getAllAutoEcoles(): Promise<autoecole[]> {
    return this.prismaService.autoecole.findMany();
  }

  async getAutoEcoleById(id: number): Promise<autoecole> {
    const autoEcole = await this.prismaService.autoecole.findUnique({ where: { id: Number(id) } });
  
    if (!autoEcole) {
      throw new NotFoundException(`Auto-école avec l'ID ${id} non trouvée`);
    }
  
    return autoEcole;
  }
  
  
  async createAutoEcole(autoEcoleData: autoecole,idCompteConnecte:number): Promise<autoecole> {
    
    const randomUsername = this.generateRandomUsername(6);

    const moniteurRoleId = await this.getMoniteurRoleId();
    
    const randomPassword = this.generateRandomPassword(9);
    
    const createdAutoEcole = await this.prismaService.autoecole.create({
      data: {
        ...autoEcoleData,
        idCompteConnecte:idCompteConnecte
      },
    });
    
    const createdUser = await this.prismaService.user.create({
      data: {
        username: randomUsername,
        password: randomPassword,
        idRole: moniteurRoleId,
        idAutoEcole: createdAutoEcole.id,
        idCompteConnecte:idCompteConnecte,
      },
    });
    return createdAutoEcole;
  }
  async updateAutoEcole(id: number, updatedAutoEcoleData: Partial<autoecole>): Promise<autoecole> {
    const existingAutoEcole = await this.prismaService.autoecole.findUnique({
      where: { id: Number(id) },
    });
  
    if (!existingAutoEcole) {
      throw new NotFoundException(`Auto-école avec l'ID ${id} non trouvée`);
    }
  
    const updatedAutoEcole = await this.prismaService.autoecole.update({
      where: { id: Number(id) }, 
      data: updatedAutoEcoleData,
    });
  
    return updatedAutoEcole;
  }
  
  async deleteAutoEcole(id: number): Promise<void> {
    // Recherche l'auto-école à supprimer
    const existingAutoEcole = await this.prismaService.autoecole.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAutoEcole) {
      throw new NotFoundException(`Auto-école avec l'ID ${id} non trouvée`);
    }

  
    await this.prismaService.user.deleteMany({
      where: { idAutoEcole: Number(id) },
    });

    
    await this.prismaService.autoecole.delete({
      where: { id: Number(id) },
    });
  }
  private generateRandomUsername(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let username = '';
    for (let i = 0; i < length; i++) {
      username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return username;
  }
  private async getMoniteurRoleId(): Promise<number> {
    const moniteurRole = await this.prismaService.roles.findFirst({
      where: {
        nom_role: 'ecole', 
      },
    });

    if (!moniteurRole) {
      throw new NotFoundException(`Rôle "moniteur" non trouvé`);
    }

    return moniteurRole.idRole;
  }
  private generateRandomPassword(length: number): string {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password; 
  }
}
