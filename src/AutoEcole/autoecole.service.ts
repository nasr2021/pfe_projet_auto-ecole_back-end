import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { autoecole } from "./autoecole.model";
import { User } from "../user/user.model"; 
import { demande } from "@prisma/client";
import { Twilio } from 'twilio';
type autoecoleWithStats = autoecole & {
  nombreCondidats: number;
  nombreMoniteurs: number;
  nombreCars: number;
  nombreUsers: number;
  nombreAutoecoles: number;
  nomberAutoecolesUser: number;
  nombreDemande: number;

};
export interface userWithStats {
  semaine: string;
  nombreUtilisateurs: number;
  totalUtilisateurs?: number; // Optionnel si vous souhaitez ajouter le total d'utilisateurs
}

type autoecoleAdminWithStats = autoecole & {
  
  nombreUsers: number;
  nombreAutoecoles: number;
};
export type ecoleWithStats = autoecole & {
  nombreCondidats: number;
  nombreMoniteurs: number;
  semaine?: string;
};
@Injectable()

export class AutoEcoleService {
  private twilioClient: Twilio;
  constructor(private prismaService: PrismaService) { this.twilioClient = new Twilio('ACb75e5dd7011e2263abacf1201a5f7e9e', 'da13b20c0cae5f0eaf50a336bbf81206');
}
  async getAllAutoEcoles(): Promise<autoecole[]> {
    return this.prismaService.autoecole.findMany();
  }
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      const response = await this.twilioClient.messages.create({
        body: message,
        from: '+13149382644',
        to: phoneNumber,
      });

      console.log('SMS Sent successfully:', response.sid);
    } catch (error) {
      console.error('Error sending SMS:', error);
    }
  }
  async getAutoEcoleById(id: number): Promise<autoecole> {
    const autoEcole = await this.prismaService.autoecole.findUnique({ where: { id: Number(id) } });
  
    if (!autoEcole) {
      throw new NotFoundException(`Auto-école avec l'ID ${id} non trouvée`);
    }
  
    return autoEcole;
  }
 
  async getStatestique(idUser: number): Promise<autoecole> {
    const autoEcole = await this.prismaService.autoecole.findFirst({
      where: { idUser: Number(idUser) },
      select: {
        condidat: true,
        moniteur: true,
        cars: true,
        demande:true
      },
    });
    if (!autoEcole) {
      throw new Error(`Auto-école avec l'ID ${idUser} non trouvée`);
    }
    const countCondidats = autoEcole.condidat.length;
    const countMoniteurs = autoEcole.moniteur.length;
    const countCars = autoEcole.cars.length;
    const countDemande = autoEcole.demande.length;
    const countUsers = await this.prismaService.user.count();
    const countAutoecoles = await this.prismaService.autoecole.count();
    const countAutoecolesUser = Number(countCondidats) + Number(countMoniteurs)
    const statistiques: autoecoleWithStats = {
      ...autoEcole,
      nombreCondidats: countCondidats,
      nombreMoniteurs: countMoniteurs,
      nombreCars: countCars,
      nombreUsers: countUsers,
      nombreAutoecoles: countAutoecoles,
      nomberAutoecolesUser: countAutoecolesUser,
      nombreDemande:countDemande,
   
    };
    return statistiques;
  }
   
  async getStatestiqueSuperAdmin(): Promise<autoecole> {
  
    const countUsers = await this.prismaService.user.count();
    const countAutoecoles = await this.prismaService.autoecole.count();
    const statistiquesSuperAdmin: autoecoleAdminWithStats = {
      
      nombreUsers: countUsers,
      nombreAutoecoles: countAutoecoles,
  
   
    };
    return statistiquesSuperAdmin;
  }
  async createAutoEcole(autoEcoleData: autoecole,idCompteConnecte:number): Promise<autoecole> {
    
    const randomUsername = this.generateRandomUsername(6);

    const moniteurRoleId = await this.getEcoleRoleId();
    
    const randomPassword = this.generateRandomPassword(9);
    const currentDate = new Date();
    currentDate.setFullYear(currentDate.getFullYear() + 1);
    const createdAutoEcole = await this.prismaService.autoecole.create({
      data: {
        ...autoEcoleData,
        temp_historique: currentDate,
        date_creation:currentDate
      },
    });
    
    const createdUser = await this.prismaService.user.create({
      data: {
        username: randomUsername,
        password: randomPassword,
        idRole: Number(moniteurRoleId),
        idAutoEcole: Number(createdAutoEcole.id),
        date_creation:currentDate
        // idCompteConnecte:Number(idCompteConnecte),
      },
    });
    await this.sendSMS(autoEcoleData.telephone, `Your account has been created. Username: ${randomUsername}, Password: ${randomPassword}`);
        
    await this.prismaService.gerantecole.create({
      data: {
          idGerant: Number(createdUser.idUser), 
      },
  });
  const updatedAutoEcole = await this.prismaService.autoecole.update({
    where: { id: Number(createdAutoEcole.id) },
    data: {
        idUser: Number(createdUser.idUser),
    },
});
    return updatedAutoEcole;
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
  private async getEcoleRoleId(): Promise<number> {
    const moniteurRole = await this.prismaService.roles.findFirst({
      where: {
        nom_role: 'ecole', 
      },
    });

    if (!moniteurRole) {
      throw new NotFoundException(`Rôle "ecole" non trouvé`);
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
  async getAutoEcoleStatistiques(idUser: number): Promise<ecoleWithStats[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Récupérer toutes les autoécoles pour l'utilisateur
    const autoecoles = await this.prismaService.autoecole.findMany({
      where: {
        idUser: Number(idUser),
      },
    });

    // Initialiser le tableau statistique avec zéro candidats et moniteurs pour chaque semaine
    const statistiques: ecoleWithStats[] = [];
    const weeksInMonth = this.getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Initialiser les statistiques par semaine
    for (let i = 0; i < weeksInMonth.length; i++) {
      statistiques.push({
        id: 0, // Remplacez par l'ID réel de l'autoécole si nécessaire
        nom: '', // Remplacez par le nom réel de l'autoécole si nécessaire
        // Autres champs de l'autoécole
        semaine: `Semaine ${i + 1}`,
        nombreCondidats: 0,
        nombreMoniteurs: 0,
      });
    }

    // Remplir le tableau statistique avec les candidats et moniteurs réels
    for (const autoecole of autoecoles) {
      const condidats = await this.prismaService.condidat.findMany({
        where: {
          idAutoecole: autoecole.id,
          date_creation: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      });

      const moniteurs = await this.prismaService.moniteur.findMany({
        where: {
          idAutoecole: autoecole.id,
          date_creation: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth,
          },
        },
      });

      // Mettre à jour les statistiques par semaine
      condidats.forEach((condidat) => {
        const weekIndex = this.getWeekIndex(condidat.date_creation, weeksInMonth);
        if (weekIndex !== -1) {
          statistiques[weekIndex].nombreCondidats++;
        }
      });

      moniteurs.forEach((moniteur) => {
        const weekIndex = this.getWeekIndex(moniteur.date_creation, weeksInMonth);
        if (weekIndex !== -1) {
          statistiques[weekIndex].nombreMoniteurs++;
        }
      });
    }

    return statistiques;
  }

  // Fonction pour obtenir toutes les semaines d'un mois donné
  private getWeeksInMonth(year: number, month: number): Date[] {
    const weeks = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let currentDay = firstDay;

    while (currentDay <= lastDay) {
      weeks.push(new Date(currentDay));
      currentDay = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate() + 7);
    }

    return weeks;
  }

  // Fonction pour obtenir l'index de la semaine à laquelle appartient une date donnée
  private getWeekIndex(date: Date, weeksInMonth: Date[]): number {
    for (let i = 0; i < weeksInMonth.length; i++) {
      const weekStart = new Date(weeksInMonth[i]);
      const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);

      if (date >= weekStart && date <= weekEnd) {
        return i;
      }
    }
    return -1; // Retourne -1 si la date ne correspond à aucune semaine dans le mois donné
  }
 
  async getUserStatestique(): Promise<userWithStats[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Récupérer tous les utilisateurs créés pour le mois en cours
    const utilisateurs = await this.prismaService.user.findMany({
      where: {
        date_creation: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // Obtenir les statistiques par semaine du mois
    const statistiques: userWithStats[] = [];
    const weeksInMonth = this.getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Initialiser le tableau statistique avec zéro utilisateurs pour chaque semaine
    for (let i = 0; i < weeksInMonth.length; i++) {
      statistiques.push({
        semaine: `Semaine ${i + 1}`,
        nombreUtilisateurs: 0,
      });
    }

    // Remplir le tableau statistique avec les utilisateurs réels
    utilisateurs.forEach((utilisateur) => {
      const weekIndex = this.getWeekIndex(utilisateur.date_creation, weeksInMonth);
      if (weekIndex !== -1) {
        statistiques[weekIndex].nombreUtilisateurs++;
      }
    });

    // Calculer le nombre total d'utilisateurs créés par semaine
    const totalUtilisateurs: number[] = new Array(weeksInMonth.length).fill(0);
    utilisateurs.forEach((utilisateur) => {
      const weekIndex = this.getWeekIndex(utilisateur.date_creation, weeksInMonth);
      if (weekIndex !== -1) {
        totalUtilisateurs[weekIndex]++;
      }
    });

    // Assigner le nombre total d'utilisateurs à chaque semaine
    statistiques.forEach((stat, index) => {
      stat.totalUtilisateurs = totalUtilisateurs[index];
    });

    return statistiques;
  }

}

