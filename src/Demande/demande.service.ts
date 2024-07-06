import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Demande } from "./demande.model";
import { demande } from "@prisma/client";
import { User } from "src/user/user.model";
export type demandeWithStats = demande & {
  nombreDemande: number;
  semaine?: string;
};
export interface demandeWith{
  semaine: string;
  nombreDemande: number;
  totalDemande?: number; // Optionnel si vous souhaitez ajouter le total de demandes
}
@Injectable()
export class DemandeService{
    constructor(private prismaservice:PrismaService){}
    
  async getDemandeStatestique(idUser: number): Promise<demandeWithStats[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Récupérer toutes les demandes pour l'utilisateur pour le mois en cours
    const demandes = await this.prismaservice.demande.findMany({
      where: {
        idUser: Number(idUser),
        date_creation: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });

    // Obtenir les statistiques par semaine du mois
    const statistiques: demandeWithStats[] = [];
    const weeksInMonth = this.getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());

    // Initialiser le tableau statistique avec zéro demandes pour chaque semaine
    for (let i = 0; i < weeksInMonth.length; i++) {
      statistiques.push({
        semaine: `Semaine ${i + 1}`,
        nombreDemande: 0,
        ...demandes[0], // Initialisation avec un objet `demande` arbitraire pour éviter l'erreur de type
      });
    }

    // Remplir le tableau statistique avec les demandes réelles
    demandes.forEach((demande) => {
      const weekIndex = this.getWeekIndex(demande.date_creation, weeksInMonth);
      if (weekIndex !== -1) {
        statistiques[weekIndex].nombreDemande++;
      }
    });

    return statistiques;
  }
  async getStatestique(): Promise<demandeWith[]> {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
    // Récupérer toutes les demandes pour l'utilisateur pour le mois en cours
    const demandes = await this.prismaservice.demande.findMany({
      where: {
       
        date_creation: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
  
    // Obtenir les statistiques par semaine du mois
    const statistiques: demandeWith[] = [];
    const weeksInMonth = this.getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());
  
    // Initialiser le tableau statistique avec zéro demandes pour chaque semaine
    for (let i = 0; i < weeksInMonth.length; i++) {
      statistiques.push({
        semaine: `Semaine ${i + 1}`,
        nombreDemande: 0,
      });
    }
  
    // Remplir le tableau statistique avec les demandes réelles
    demandes.forEach((demande) => {
      const weekIndex = this.getWeekIndex(demande.date_creation, weeksInMonth);
      if (weekIndex !== -1) {
        statistiques[weekIndex].nombreDemande++;
      }
    });
  
    // Calculer le nombre total de demandes par semaine
    const totalDemandes: number[] = new Array(weeksInMonth.length).fill(0);
    demandes.forEach((demande) => {
      const weekIndex = this.getWeekIndex(demande.date_creation, weeksInMonth);
      if (weekIndex !== -1) {
        totalDemandes[weekIndex]++;
      }
    });
  
    // Assigner le nombre total de demandes à chaque semaine
    statistiques.forEach((stat, index) => {
      stat.totalDemande = totalDemandes[index];
    });
  
    return statistiques;
  }
  
  async getAllDemandes(idCompteConnecte: number, idRole: string): Promise<Demande[]> {
    const role = await this.prismaservice.roles.findFirst({
        where: {
            idRole: parseInt(idRole, 10)
        },
        select: {
            nom_role: true
        }
    });

    if (!role) {
        throw new Error(`Role with ID ${idRole} not found.`);
    }

    const userRole = role.nom_role;
    let demandes;

    if (userRole === 'ecole') {
      const user = await this.prismaservice.autoecole.findFirst({
        where:{
          idUser: Number(idCompteConnecte)
        },
        select:{
          id:true
        }
      })
      const autoecoleid = user.id
        demandes = await this.prismaservice.demande.findMany({
            where: {
              idAutoecole:Number(autoecoleid),
                statut: 'en_attente',
                type: 'Update date'
            },
            include: {
                autoecole: true,
                user: true,
                evenement: true
            },
        });
    } else if (userRole === 'manager') {
        demandes = await this.prismaservice.demande.findMany({
            where: {
                statut: 'en_attente',
                NOT: {
                    type: 'Update date'
                }
            },
            include: {
                autoecole: true,
                forfait: true,
                user: true,
            },
        });
    } else {
        return null;
    }

    // Format the date_creation field
    return demandes.map(demande => ({
        ...demande,
        date_creation: this.formatDate(demande.date_creation),
        date_debut:this.formatDate(demande.date_debut),
        date_fin:this.formatDate(demande.date_fin),
    }));
}

      
      private formatDate(date: string | Date): string {
        if (typeof date === 'string') {
          // Assuming date is in ISO format 'yyyy-mm-ddThh:mm:ss'
          const parts = date.split('T');
          return parts[0] + ' ' + parts[1].substring(0, 5); // Adjust to 'yyyy-mm-dd hh:mm'
        } else if (date instanceof Date) {
          const year = date.getFullYear();
          const month = this.padNumber(date.getMonth() + 1);
          const day = this.padNumber(date.getDate());
          const hours = this.padNumber(date.getHours());
          const minutes = this.padNumber(date.getMinutes());
          return `${year}-${month}-${day} ${hours}:${minutes}`;
        } else {
          throw new Error('Invalid date format');
        }
      }
      
      private padNumber(num: number): string {
        return num.toString().padStart(2, '0');
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
     
  async forgetPassword(username: string): Promise<string | null> {
    console.log('username25', username);
    const user = await this.prismaservice.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    const password = user.password;
    return password;
  }
}