import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Calendrier } from './calendrier.model';
import { Category } from 'src/Category/Category';
import { Prisma, calendrier } from '@prisma/client';
import { autoecole } from 'src/AutoEcole/autoecole.model';
import { CalendrierDto } from './dto';
import { Twilio } from 'twilio';

export type evenementWithStats = calendrier & {
  nombreEvenements: number;
  semaine?: string;
  nombreCandidats?: number;
  autoEcoles?: string[];
};
@Injectable()
export class CalendrierService {
  private twilioClient: Twilio;
  constructor(private prismaservice: PrismaService) { this.twilioClient = new Twilio('ACb75e5dd7011e2263abacf1201a5f7e9e', 'da13b20c0cae5f0eaf50a336bbf81206');
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
  async getCategoryIdByCategoryName(nom_categorie: string): Promise<number | null> {
    
     
    const category = await this.prismaservice.category.findFirst({
        where: { nom_categorie: nom_categorie },
        select: { idCategory: true },
    });
    return category ? category.idCategory : null;
}
async getAllCalendrier(idCompteConnecte: number): Promise<Calendrier[]> {
  return await this.prismaservice.calendrier.findMany({
    where: {
      idUser: Number(idCompteConnecte)
     } });
}
async getAllCalendrierByAutoEcole(idCompteConnecte: number): Promise<Calendrier[]> {

  const user = await this.prismaservice.user.findUnique({
      where: { idUser: Number(idCompteConnecte) }
  });

  if (!user || !user.idAutoEcole) {
      throw new Error(`Aucune auto-école associée à cet utilisateur.`);
  }

  const autoEcoleId = user.idAutoEcole;

  
  return await this.prismaservice.calendrier.findMany({
      where: {
        idAutoEcole: Number(autoEcoleId)
      }
  });
}
async getCalendriersByUserId(idConnecte: number, userole: string): Promise<Calendrier[]> {
  const role = await this.prismaservice.roles.findUnique({
    where: {
      idRole: parseInt(userole, 10),
    },
    select: {
      nom_role: true,
    },
  });

  if (!role) {
    throw new NotFoundException(`Role with ID ${userole} not found`);
  }

  const roleName = role.nom_role;

  let calendriers: Calendrier[] = [];

  if (roleName === 'manager') {
    calendriers = await this.prismaservice.calendrier.findMany();
  } else if (roleName === 'candidat') {
    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idUser: Number(idConnecte),
      },
    });
  } else if (roleName === 'ecole') {
    const ecole = await this.prismaservice.gerantecole.findUnique({
      where: { idGerant: Number(idConnecte) },
      select: { autoecole: true },
    });

    const idautoecole = ecole.autoecole[0].id;

    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idAutoEcole: Number(idautoecole),
      },
    });
  } else if (roleName === 'moniteur') {
    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idMoniteur: Number(idConnecte),
      },
    });
  }

  // Formatting dates
  calendriers = calendriers.map((calendrier) => ({
    ...calendrier,
    date_debut: this.formatDate(calendrier.date_debut),
    date_fin: this.formatDate(calendrier.date_fin),
  }));

  return calendriers;
}
  async getHistory(idConnecte: number, userole: string): Promise<Calendrier[]> {
    const role = await this.prismaservice.roles.findUnique({
      where: {
        idRole: parseInt(userole, 10),
      },
      select: {
        nom_role: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${userole} not found`);
    }

    const roleName = role.nom_role;

    let calendriers: Calendrier[] = [];

    if (roleName === 'manager') {
      calendriers = await this.prismaservice.calendrier.findMany();
    } else if (roleName === 'candidat') {
      calendriers = await this.prismaservice.calendrier.findMany({
        where: {
          idUser: Number(idConnecte),
        },
        include:{
          condidat: {
            include: {
              user: true,
            },
          },
          cars: true,
          moniteur: {
            include: {
              user: true,
            },
          },
        }
      });
    } 
    else if (roleName === 'ecole') {
      const ecole = await this.prismaservice.gerantecole.findUnique({
        where: { idGerant: Number(idConnecte) },
        select: { autoecole: true },
      });
  
      if (ecole && ecole.autoecole.length > 0) {
        const idautoecole = ecole.autoecole[0].id;
        const tempHistorique = ecole.autoecole[0].temp_historique; // Assurez-vous que temp_historique est récupéré
  
        // Vérifiez si la date actuelle est supérieure à temp_historique
        const currentDate = new Date();
        const tempHistoriqueDate = new Date(tempHistorique);
        if (currentDate > tempHistoriqueDate) {
          return []; // Ne retournez pas les calendriers
        }
  
        calendriers = await this.prismaservice.calendrier.findMany({
          where: {
            idAutoEcole: Number(idautoecole),
          },
          include: {
            condidat: {
              include: {
                user: true,
              },
            },
            cars: true,
            moniteur: {
              include: {
                user: true,
              },
            },
          },
        });
      }
    }
    // else if (roleName === 'ecole') {
    //   const ecole = await this.prismaservice.gerantecole.findUnique({
    //     where: { idGerant: Number(idConnecte) },
    //     select: { autoecole: true },
    //   });

    //   const idautoecole = ecole.autoecole[0].id;

    //   calendriers = await this.prismaservice.calendrier.findMany({
    //     where: {
    //       idAutoEcole: Number(idautoecole),
    //     },
    //     include:{
    //       condidat: {
    //         include: {
    //           user: true,
    //         },
    //       },
    //       cars: true,
    //       moniteur: {
    //         include: {
    //           user: true,
    //         },
    //       },
    //     }
    //   });
    // }
    else if (roleName === 'moniteur') {
      calendriers = await this.prismaservice.calendrier.findMany({
        where: {
          idMoniteur: Number(idConnecte),
        },
        include:{
          condidat: {
            include: {
              user: true,
            },
          },
          cars: true,
          moniteur:{
            include: {
              user: true,
            },
          },
        }
      });
    }

    // Filtrer les calendriers où date_fin est supérieure à la date actuelle
    const currentDate = new Date();
    calendriers = calendriers.filter((calendrier) => new Date(calendrier.date_fin) < currentDate);

    // Formatting dates
    calendriers = calendriers.map((calendrier) => ({
      ...calendrier,
      date_debut: this.formatDate(calendrier.date_debut),
      date_fin: this.formatDate(calendrier.date_fin),
      date_creation: calendrier.date_creation ? this.formatDate(calendrier.date_creation) : null,
    }));

    return calendriers;
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


async createCalendrier(data: any, idCompteConnecte: number): Promise<string | Calendrier> {
  console.log("Données reçues pour la création du calendrier :", data);
  console.log("ID du compte connecté :", idCompteConnecte);

  const connectedUser = await this.prismaservice.gerantecole.findUnique({
    where: { idGerant: Number(idCompteConnecte) },
    select: { autoecole: true }
  });

  if (!connectedUser || !connectedUser.autoecole[0]?.id) {
    throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
  }

  const idAutoEcole = connectedUser.autoecole[0].id;
  console.log("ID de l'auto-école récupéré :", idAutoEcole);
  const currentDate = new Date();
  const newDateDebut = new Date(data.event.date_debut);
  const newDateFin = new Date(data.event.date_fin);

  // Vérification pour le moniteur
  const idMoniteur = Number(data.event.idMoniteur);
  if (isNaN(idMoniteur)) {
    throw new Error(`L'identifiant du moniteur '${data.event.idMoniteur}' n'est pas valide.`);
  }

  const moniteurCalendrier = await this.prismaservice.calendrier.findMany({
    where: { idMoniteur },
    select: { date_debut: true, date_fin: true }
  });

  for (const event of moniteurCalendrier) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    if (
      (newDateDebut >= eventDateDebut && newDateDebut < eventDateFin) ||
      (newDateFin > eventDateDebut && newDateFin <= eventDateFin) ||
      (newDateDebut <= eventDateDebut && newDateFin >= eventDateFin)
    ) {
      return "Le créneau horaire n'est pas disponible pour le moniteur.";
    }
  }

  // Vérification pour la voiture
  const idVoiture = Number(data.event.idVoiture);
  if (isNaN(idVoiture)) {
    throw new Error(`L'identifiant de la voiture '${data.event.idVoiture}' n'est pas valide.`);
  }

  const voitureCalendrier = await this.prismaservice.calendrier.findMany({
    where: { idVoiture },
    select: { date_debut: true, date_fin: true }
  });

  for (const event of voitureCalendrier) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    if (
      (newDateDebut >= eventDateDebut && newDateDebut < eventDateFin) ||
      (newDateFin > eventDateDebut && newDateFin <= eventDateFin) ||
      (newDateDebut <= eventDateDebut && newDateFin >= eventDateFin)
    ) {
      return "Le créneau horaire n'est pas disponible pour la voiture.";
    }
  }

  // Vérification pour le candidat
  const idUser = Number(data.event.idUser);
  if (isNaN(idUser)) {
    throw new Error(`L'identifiant du candidat '${data.event.idUser}' n'est pas valide.`);
  }

  const candidatCalendrier = await this.prismaservice.calendrier.findMany({
    where: { idUser },
    select: { date_debut: true, date_fin: true}
  });
 
  for (const event of candidatCalendrier) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    if (
      (newDateDebut >= eventDateDebut && newDateDebut < eventDateFin) ||
      (newDateFin > eventDateDebut && newDateFin <= eventDateFin) ||
      (newDateDebut <= eventDateDebut && newDateFin >= eventDateFin)
    ) {
      return "Le créneau horaire n'est pas disponible pour le candidat.";
    }
  }
 
  try {
    const currentDate = new Date();
    const newCalendrier = await this.prismaservice.calendrier.create({
      data: {
        nom_evenement: data.event.nom_evenement,
        type: data.event.type,
        idUser,
        idVoiture,
        date_debut: newDateDebut.toISOString(),
        date_fin: newDateFin.toISOString(),
        idAutoEcole,
        idMoniteur,
        date_creation: currentDate
      }
    });
const user= await this.prismaservice.user.findFirst({
  where:{
    idUser:Number(data.idUser)
  }
})
const tel= user.numero_telephone1
    console.log("Nouveau calendrier créé :", newCalendrier);
    await this.sendSMS(tel, `Your account has been created. start: ${ newCalendrier.date_debut}, end: ${newCalendrier.date_fin}`);
       
    return newCalendrier;
  } catch (error) {
    console.error("Erreur lors de la création du calendrier :", error);
    throw new Error("Une erreur est survenue lors de la création du calendrier.");
  }
}

async updateCalendrier(idEvenement: number, data: Calendrier): Promise<string | Calendrier> {
  const evenementExistant = await this.prismaservice.calendrier.findUnique({
    where: { idEvenement: Number(idEvenement) }
  });

  if (!evenementExistant) {
    throw new Error(`Événement avec l'ID ${idEvenement} non trouvé.`);
  }
  console.log("Valeur data:", data);
  console.log("Valeur de idMoniteur:", data.idMoniteur); 
  const newDateDebut = new Date(data.date_debut);
  const newDateFin = new Date(data.date_fin);

  // Vérification pour le moniteur
  const moniteurCalendrier = await this.prismaservice.calendrier.findMany({
    where: {
      idMoniteur: { equals: Number(data.idMoniteur) }, // Using IntNullableFilter
      idEvenement: { not: Number(idEvenement) }         // Using IntFilter
    },
    select: { date_debut: true, date_fin: true }
  });

  for (const event of moniteurCalendrier) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    if (
      (newDateDebut >= eventDateDebut && newDateDebut < eventDateFin) ||
      (newDateFin > eventDateDebut && newDateFin <= eventDateFin) ||
      (newDateDebut <= eventDateDebut && newDateFin >= eventDateFin)
    ) {
      return "Le créneau horaire n'est pas disponible pour le moniteur.";
    }
  }

  // Vérification pour la voiture
  const voitureCalendrier = await this.prismaservice.calendrier.findMany({
    where: {
      idVoiture: { equals: Number(data.idVoiture) }, // Using IntNullableFilter
      idEvenement: { not: Number(idEvenement) }      // Using IntFilter
    },
    select: { date_debut: true, date_fin: true }
  });

  for (const event of voitureCalendrier) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    if (
      (newDateDebut >= eventDateDebut && newDateDebut < eventDateFin) ||
      (newDateFin > eventDateDebut && newDateFin <= eventDateFin) ||
      (newDateDebut <= eventDateDebut && newDateFin >= eventDateFin)
    ) {
      return "Le créneau horaire n'est pas disponible pour la voiture.";
    }
  }

  // Vérification pour le candidat
  const candidatCalendrier = await this.prismaservice.calendrier.findMany({
    where: {
      idUser: { equals: Number(data.idUser) }, // Using IntNullableFilter
      idEvenement: { not: Number(idEvenement) } // Using IntFilter
    },
    select: { date_debut: true, date_fin: true }
  });

  for (const event of candidatCalendrier) {
    const eventDateDebut = new Date(event.date_debut);
    const eventDateFin = new Date(event.date_fin);

    if (
      (newDateDebut >= eventDateDebut && newDateDebut < eventDateFin) ||
      (newDateFin > eventDateDebut && newDateFin <= eventDateFin) ||
      (newDateDebut <= eventDateDebut && newDateFin >= eventDateFin)
    ) {
      return "Le créneau horaire n'est pas disponible pour le candidat.";
    }
  }

  const updatedCalendrier = await this.prismaservice.calendrier.update({
    where: { idEvenement: Number(idEvenement) },
    data: { ...data }
  });

  console.log("Calendrier mis à jour :", updatedCalendrier);

  return updatedCalendrier;
}

async deleteCalendrier(idEvenement:number):Promise<Calendrier>{
  return this.prismaservice.calendrier.delete({
      where:{idEvenement:Number(idEvenement)}
  })
}
async getEvent(idConnecte: number, userole: string): Promise<Calendrier[]> {
  const role = await this.prismaservice.roles.findUnique({
    where: {
      idRole: parseInt(userole, 10),
    },
    select: {
      nom_role: true,
    },
  });

  if (!role) {
    throw new NotFoundException(`Role with ID ${userole} not found`);
  }

  const roleName = role.nom_role;

  let calendriers: Calendrier[] = [];

  if (roleName === 'manager') {
    calendriers = await this.prismaservice.calendrier.findMany();
  } else if (roleName === 'candidat') {
    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idUser: Number(idConnecte),
      },
      include: {
        condidat: {
          include: {
            user: true,
          },
        },
        cars: true,
        moniteur: {
          include: {
            user: true,
          },
        },
      },
    });
  } else if (roleName === 'ecole') {
    const ecole = await this.prismaservice.gerantecole.findUnique({
      where: { idGerant: Number(idConnecte) },
      select: { autoecole: true },
    });

    const idautoecole = ecole.autoecole[0].id;

    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idAutoEcole: Number(idautoecole),
      },
      include: {
        condidat: {
          include: {
            user: true,
          },
        },
        cars: true,
        moniteur: {
          include: {
            user: true,
          },
        },
      },
    });
  } else if (roleName === 'moniteur') {
    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idMoniteur: Number(idConnecte),
      },
      include: {
        condidat: {
          include: {
            user: true,
          },
        },
        cars: true,
        moniteur: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  // Filter the events to only include those occurring within the next 48 hours
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + 48 * 60 * 60 * 1000);

  calendriers = calendriers.filter(
    (calendrier) => new Date(calendrier.date_debut) <= futureDate && new Date(calendrier.date_debut) >= currentDate
  );

  // Formatting dates
  calendriers = calendriers.map((calendrier) => ({
    ...calendrier,
    date_debut: this.formatDate(calendrier.date_debut),
    date_fin: this.formatDate(calendrier.date_fin),
    date_creation: calendrier.date_creation ? this.formatDate(calendrier.date_creation) : null,
  }));

  return calendriers;
}

async getEvenementStatistiques(idUser: number, userole:string): Promise<evenementWithStats[]> {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Vérifier si l'utilisateur appartient à une auto-école
  const ecole = await this.prismaservice.autoecole.findFirst({
    where: {
      idUser: Number(idUser),
    },
  });
  const role = await this.prismaservice.roles.findUnique({
    where: {
      idRole: parseInt(userole, 10),
    },
    select: {
      nom_role: true,
    },
  });

  if (!role) {
    throw new NotFoundException(`Role with ID ${userole} not found`);
  }

  const roleName = role.nom_role;
  // Récupérer tous les événements pour l'utilisateur pour le mois en cours
  let evenements: calendrier[];

  if (ecole) {
    // Utilisateur trouvé dans une auto-école
    evenements = await this.prismaservice.calendrier.findMany({
      where: {
        idAutoEcole: ecole.id,
        date_debut: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
    });
  } else {
if(roleName==='moniteur'){
  evenements = await this.prismaservice.calendrier.findMany({
    where: {
      idMoniteur: Number(idUser),
      date_debut: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
  });
}
else{
  evenements = await this.prismaservice.calendrier.findMany({
    where: {
      idUser: Number(idUser),
      date_debut: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
  });
}
    // Utilisateur non trouvé dans une auto-école
  
  }

  // Initialiser le tableau statistique avec zéro événements pour chaque semaine
  const statistiques: evenementWithStats[] = [];
  const weeksInMonth = this.getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Initialiser les statistiques par semaine
  for (let i = 0; i < weeksInMonth.length; i++) {
    statistiques.push({
      idAutoEcole: 0,
      semaine: `Semaine ${i + 1}`,
      nombreEvenements: 0,
      idEvenement: 0,
      nom_evenement: '',
      type: '',
      date_debut: undefined,
      date_fin: undefined,
      description: '',
      idUser: 0,
      idCompteConnecte: 0,
      idMoniteur: 0,
      date_creation: undefined,
      date_modification: undefined,
      idCategorie: 0,
      idVoiture: 0,
      idNotification: 0,
    });
  }

  // Remplir le tableau statistique avec les événements réels
  evenements.forEach((evenement) => {
    const weekIndex = this.getWeekIndex(evenement.date_debut, weeksInMonth);
    if (weekIndex !== -1) {
      statistiques[weekIndex].nombreEvenements++;
    }
  });

  return statistiques;
}

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
private getWeekIndex(date: Date, weeksInMonth: Date[]): number {
  for (let i = 0; i < weeksInMonth.length; i++) {
    const weekStart = new Date(weeksInMonth[i]);
    const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);

    if (date >= weekStart && date <= weekEnd) {
      return i;
    }
  }
  return -1; 
}
async getAllCalendrierUser(idUser: number): Promise<Calendrier[]> {
  return await this.prismaservice.calendrier.findMany({
    where: {
      OR: [
        { idUser: Number(idUser) },
        { idMoniteur: Number(idUser) }
      ]
    }
  });
}
}
