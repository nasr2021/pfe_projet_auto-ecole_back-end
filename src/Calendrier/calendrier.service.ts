import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Calendrier } from './calendrier.model';
import { Prisma, calendrier } from '@prisma/client';
import { autoecole } from 'src/AutoEcole/autoecole.model';
import { CalendrierDto } from './dto';
import { Twilio } from 'twilio';
import admin from 'src/firebase-admin';
import * as cron from 'node-cron';
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
      to: `+216${phoneNumber}`,
    });

    console.log('SMS Sent successfully:', response.sid);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
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
async getDemandeCalendriersByUser(idConnecte: number, userole: string): Promise<Calendrier[]> {
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

  const currentDate = new Date();
  if (roleName === 'candidat') {
    calendriers = await this.prismaservice.calendrier.findMany({
      where: {
        idUser: Number(idConnecte),
        date_creation: {
          lt: currentDate,
        },
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

// async getDemandeCalendriersByUser(idConnecte: number, userole: string): Promise<Calendrier[]> {
//   const role = await this.prismaservice.roles.findUnique({
//     where: {
//       idRole: parseInt(userole, 10),
//     },
//     select: {
//       nom_role: true,
//     },
//   });

//   if (!role) {
//     throw new NotFoundException(`Role with ID ${userole} not found`);
//   }

//   const roleName = role.nom_role;
//   const currentDate = new Date();

//   if (roleName === 'candidat') {
//    return await this.prismaservice.calendrier.findMany({
//       where: {
//         idUser: Number(idConnecte),
//         date_debut: {
//           gte: currentDate,
//         },
//       },
//     });
//   } 
//   // Formatting dates
 


// }
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
          voitures: true,
          moniteur: {
            include: {
              user: true,
            },
          },
        }
      });
      const currentDate = new Date();

      const expiredCalendriers = calendriers.filter(calendrier => new Date(calendrier.date_fin) < currentDate);

      // Calculer les heures pour les événements expirés
      const heuresCode = expiredCalendriers
          .filter(calendrier => calendrier.type === 'code')
          .reduce((acc, calendrier) => acc + this.calculateHoursDifference(new Date(calendrier.date_debut), new Date(calendrier.date_fin)), 0);

      const heuresConduit = expiredCalendriers
          .filter(calendrier => calendrier.type === 'conduit')
          .reduce((acc, calendrier) => acc + this.calculateHoursDifference(new Date(calendrier.date_debut), new Date(calendrier.date_fin)), 0);

      // await this.prismaservice.condidat.update({
      //     where: { idCondidat: idConnecte },
      //     data: {
      //         // nombre_heur_code: { increment: heuresCode },
      //         // nombre_heur_conduit: { increment: heuresConduit }
      //     }
      // });
  
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
            voitures: true,
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
          voitures: true,
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
  private calculateHoursDifference(start: Date, end: Date): number {
    const msDifference = end.getTime() - start.getTime();
    return msDifference / (1000 * 60 * 60);
}
async getTempHistorique(idConnecte: number, userole: number):Promise<string>{
 
 if(userole==2){  const historique=await this.prismaservice.autoecole.findFirst({
  where:{
    idUser:Number(idConnecte)
  },
  select:{
    temp_historique:true
  }
})
const h= this.formatDate(historique.temp_historique)
return h}
else{
  return
}


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

  const newDateDebut = new Date(data.eventWithToken.date_debut);
  const newDateFin = new Date(data.eventWithToken.date_fin);

  // Vérification pour le moniteur
  const idMoniteur = Number(data.eventWithToken.idMoniteur);
  if (isNaN(idMoniteur)) {
    throw new Error(`L'identifiant du moniteur '${data.eventWithToken.idMoniteur}' n'est pas valide.`);
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
  const idVoiture = Number(data.eventWithToken.idVoiture);
  if (isNaN(idVoiture)) {
    throw new Error(`L'identifiant de la voiture '${data.eventWithToken.idVoiture}' n'est pas valide.`);
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
  const idUser = Number(data.eventWithToken.idUser);
  if (isNaN(idUser)) {
    throw new Error(`L'identifiant du candidat '${data.eventWithToken.idUser}' n'est pas valide.`);
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
        nom_evenement: data.eventWithToken.nom_evenement,
        type: data.eventWithToken.type,
        idUser,
        idVoiture,
        date_debut: newDateDebut.toISOString(),
        date_fin: newDateFin.toISOString(),
        idAutoEcole,
        idMoniteur,
        date_creation: currentDate
      }
    });
    // Calculer la différence en millisecondes
const differenceMs = newCalendrier.date_fin.getTime() - newCalendrier.date_debut.getTime();

// Convertir la différence en minutes
if (newCalendrier.type === 'Hour code') {
  // Calculer la différence en minutes
  const differenceInHours = differenceMs / (1000 * 60);
  const differenceMinutes  = Math.round(differenceInHours / 60);
  // Récupérer les données actuelles du condidat
  const condidatData = await this.prismaservice.condidat.findUnique({
    where: { idCondidat: idUser },
    select: { nombre_heur_code: true },
  });

  if (!condidatData) {
    throw new Error(`No condidat found with id ${idUser}.`);
  }

  // Calculer le nouveau nombre d'heures de code
  const newNombreHeuresCode = (condidatData.nombre_heur_code || 0) + differenceMinutes;

  // Mettre à jour le condidat avec les nouvelles valeurs
  const updatedCondidat = await this.prismaservice.condidat.update({
    where: { idCondidat: idUser },
    data: {
      nombre_heur_code: newNombreHeuresCode,
    },
  });

  console.log(`Updated condidat: ${JSON.stringify(updatedCondidat)}`);
}

if (newCalendrier.type === 'Hour conduit') {
  // Calculer la différence en minutes
  const differenceMinutes = differenceMs / (1000 * 60);

  // Récupérer les données actuelles du condidat
  const condidatData = await this.prismaservice.condidat.findUnique({
    where: { idCondidat: idUser },
    select: { nombre_heur_conduit: true },
  });

  if (!condidatData) {
    throw new Error(`No condidat found with id ${idUser}.`);
  }

  // Calculer le nouveau nombre d'heures de conduite
  const newNombreHeuresConduit = (condidatData.nombre_heur_conduit || 0) + differenceMinutes;

  // Mettre à jour le condidat avec les nouvelles valeurs
  const updatedCondidat = await this.prismaservice.condidat.update({
    where: { idCondidat: idUser },
    data: {
      nombre_heur_conduit: newNombreHeuresConduit,
    },
  });

  console.log(`Updated condidat: ${JSON.stringify(updatedCondidat)}`);
}

    console.log('date_debut:', newDateFin); 
    console.log('newCalendrier:', newCalendrier);
    
    const user = await this.prismaservice.user.findFirst({
      where: { idUser: Number(data.eventWithToken.idUser) }
    });
    
    const tel = user.numero_telephone1;
    console.log("Nouveau calendrier créé :", newCalendrier);
    
    const firebaseToken = data.eventWithToken.firebaseToken;
    console.log('firebaseToken', firebaseToken);
    const moniteur= await this.prismaservice.user.findUnique({
      where:{
        idUser:Number(idMoniteur)
      },
      select:{
        nom:true,
        prenom: true,

      }
    })
  
    await this.prismaservice.notification.create({
      data: {
        lu: false,
        idEvenement: newCalendrier.idEvenement,
        idUser: data.eventWithToken.idUser,
        description: `Your ${newCalendrier.type} date has been set from ${this.formatDate(newCalendrier.date_debut)} to ${this.formatDate(newCalendrier.date_fin)} with instructor ${moniteur.nom} ${moniteur.prenom}.`,
        date_creation: currentDate,
      },
    });
   // Planifier les notifications
   this.scheduleNotifications({
    date_debut: newCalendrier.date_debut,
    firebaseToken: data.eventWithToken.firebaseToken,
    idUser: data.eventWithToken.idUser,
    idEvenement: newCalendrier.idEvenement,
    type: newCalendrier.type,
  });
    if (firebaseToken) {
      const message = {
        notification: {
        
          title: 'Evenement ',
          body: 'Votre evenement  a été crée avec succès.',
        },
        token: firebaseToken,
      };
      console.log('message', message);
      try {
        const response = await admin.messaging().send(message);
        console.log('Notification envoyée avec succès:', response);
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
      }
    } else {
      console.log('No Firebase token available.');
    }
    // await this.sendSMS(data.numero_telephone1, `Your account has been created. Your username: ${newCalendrier.date_debut} and your password: ${}. Please keep this information secure.`);
    // const userSms= await this.prismaservice.user.findUnique({
    //   where:{
    //     idUser:Number(newCalendrier.idUser)
    //   },
    //   select:{
    //     numero_telephone1:true
    //   }
    // })
      console.log("Calendrier cree :", newCalendrier);
      await this.sendSMS(tel, `Your driving course starts on ${this.formatDate(newCalendrier.date_debut)} and ends on ${this.formatDate(newCalendrier.date_fin)}. You can view your schedule on our website.`);
         
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

  const newDateDebut = new Date(data.date_debut);
  const newDateFin = new Date(data.date_fin);

  // Calculer la différence en minutes entre la nouvelle date de début et la nouvelle date de fin
  const differenceMs = newDateFin.getTime() - newDateDebut.getTime();
  const differenceMinutes = differenceMs / (1000 * 60);

  // Vérification pour le moniteur
  const moniteurCalendrier = await this.prismaservice.calendrier.findMany({
    where: {
      idMoniteur: { equals: Number(data.idMoniteur) }, // Utilisation de IntNullableFilter
      idEvenement: { not: Number(idEvenement) }         // Utilisation de IntFilter
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
      idVoiture: { equals: Number(data.idVoiture) }, // Utilisation de IntNullableFilter
      idEvenement: { not: Number(idEvenement) }      // Utilisation de IntFilter
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
      idUser: { equals: Number(data.idUser) }, // Utilisation de IntNullableFilter
      idEvenement: { not: Number(idEvenement) } // Utilisation de IntFilter
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

  // Mettre à jour l'événement calendrier
  const updatedCalendrier = await this.prismaservice.calendrier.update({
    where: { idEvenement: Number(idEvenement) },
    data: { ...data }
  });

  // Mettre à jour le condidat avec les nouvelles valeurs d'heures de code ou de conduite
  if (data.type === 'Hour code' || data.type === 'Hour conduit') {
    // Récupérer l'idUser de l'événement
    const idUser = data.idUser;

    // Récupérer les données actuelles du condidat
    const condidatData = await this.prismaservice.condidat.findUnique({
      where: { idCondidat: idUser },
      select: { nombre_heur_code: true, nombre_heur_conduit: true }
    });

    if (!condidatData) {
      throw new Error(`No condidat found with id ${idUser}.`);
    }

    if (data.type === 'Hour code') {
      // Calculer le nouveau nombre d'heures de code
      const newNombreHeuresCode = (condidatData.nombre_heur_code || 0) + differenceMinutes;

      // Mettre à jour le condidat avec les nouvelles valeurs
      await this.prismaservice.condidat.update({
        where: { idCondidat: idUser },
        data: {
          nombre_heur_code: newNombreHeuresCode,
        },
      });
    } else if (data.type === 'Hour conduit') {
      // Calculer le nouveau nombre d'heures de conduite
      const newNombreHeuresConduit = (condidatData.nombre_heur_conduit || 0) + differenceMinutes;

      // Mettre à jour le condidat avec les nouvelles valeurs
      await this.prismaservice.condidat.update({
        where: { idCondidat: idUser },
        data: {
          nombre_heur_conduit: newNombreHeuresConduit,
        },
      });
    }
  }
const userSms= await this.prismaservice.user.findUnique({
  where:{
    idUser:Number(data.idUser)
  },
  select:{
    numero_telephone1:true
  }
})
  console.log("Calendrier mis à jour :", updatedCalendrier);
  await this.sendSMS(userSms.numero_telephone1, `Your driving course starts on ${updatedCalendrier.date_debut} and ends on ${updatedCalendrier.date_fin}. You can view your schedule on our website.`);

  return updatedCalendrier;
}
async deleteCalendrier(idEvenement: number): Promise<Calendrier> {
  // Récupérer l'événement à supprimer
  const event = await this.prismaservice.calendrier.findUnique({
    where: { idEvenement: Number(idEvenement) },
  });

  if (!event) {
    throw new Error(`Event with id ${idEvenement} not found.`);
  }

  // Vérifier le type de l'événement
  if (event.type === 'Hour code' || event.type === 'Hour conduit') {
    // Calculer la différence en minutes entre la date de début et la date de fin
    const startDate = new Date(event.date_debut);
    const endDate = new Date(event.date_fin);
    const differenceMs = endDate.getTime() - startDate.getTime();
    const differenceMinutes = differenceMs / (1000 * 60);

    // Mettre à jour le nombre d'heures correspondant dans le condidat
    if (event.type === 'Hour code') {
      // Récupérer l'idUser de l'événement
      const idUser = event.idUser;

      // Récupérer les données actuelles du condidat
      const condidatData = await this.prismaservice.condidat.findUnique({
        where: { idCondidat: idUser },
        select: { nombre_heur_code: true },
      });

      if (!condidatData) {
        throw new Error(`No condidat found with id ${idUser}.`);
      }

      // Calculer le nouveau nombre d'heures de code
      const newNombreHeuresCode = (condidatData.nombre_heur_code || 0) - differenceMinutes;

      // Mettre à jour le condidat avec les nouvelles valeurs
      await this.prismaservice.condidat.update({
        where: { idCondidat: idUser },
        data: {
          nombre_heur_code: newNombreHeuresCode,
        },
      });
      const c = await this.prismaservice.user.findUnique({
        where: { idUser: Number(idUser) },
        select: { numero_telephone1:true },
      });
      await this.sendSMS(c.numero_telephone1, ` The driving course scheduled to start on ${event.date_debut} and end on ${event.date_fin} has not been organized. Please visit our website for more information.`);
         
    } 
    else if (event.type === 'Hour conduit') {
      // Récupérer l'idUser de l'événement
      const idUser = event.idUser;

      // Récupérer les données actuelles du condidat
      const condidatData = await this.prismaservice.condidat.findUnique({
        where: { idCondidat: idUser },
        select: { nombre_heur_conduit: true ,
          
        },
      });

      if (!condidatData) {
        throw new Error(`No condidat found with id ${idUser}.`);
      }

      // Calculer le nouveau nombre d'heures de conduite
      const newNombreHeuresConduit = (condidatData.nombre_heur_conduit || 0) - differenceMinutes;

      // Mettre à jour le condidat avec les nouvelles valeurs
  await this.prismaservice.condidat.update({
        where: { idCondidat: idUser },
        data: {
          nombre_heur_conduit: newNombreHeuresConduit,
        },
      });
   
      const c = await this.prismaservice.user.findUnique({
        where: { idUser: Number(idUser) },
        select: { numero_telephone1:true },
      });
      await this.sendSMS(c.numero_telephone1, ` The driving course scheduled to start on ${event.date_debut} and end on ${event.date_fin} has not been organized. Please visit our website for more information.`);
       
    }

  }
  const ecole_updated_sms= await this.prismaservice.calendrier.findUnique({
    where:{
      idEvenement: Number(idEvenement)
    },
    select:{
      autoecole:{
        select:{
          sms:true
        }
      }
    }
  });
  const autoecoleSms=ecole_updated_sms.autoecole.sms
  const updatedSms = autoecoleSms - 1;
  const updatecole= await this.prismaservice.autoecole.update({
    where:{
      id:Number(autoecoleSms)
    },
    data:{
      sms:Number(updatedSms)
    }
  })
  // Supprimer l'événement
  return this.prismaservice.calendrier.delete({
    where: { idEvenement: Number(idEvenement) },
  });
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
        voitures: true,
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
        voitures: true,
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
        voitures: true,
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
 
      idVoiture: 0,
      idNotification: 0,
      idContrat:0
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


async scheduleNotifications(event: any) {
  const { date_debut, firebaseToken, idUser, idEvenement, type } = event;
  const dateDebut = new Date(date_debut);
  const currentDate = new Date();

  const intervals = [
    { label: '24 hours', milliseconds: 24 * 60 * 60 * 1000 },
    { label: '2 hours', milliseconds: 2 * 60 * 60 * 1000 },
    { label: '30 minutes', milliseconds: 30 * 60 * 1000 },
    { label: '1 minute', milliseconds: 1 * 60 * 1000 },
  ];

  intervals.forEach(async (interval) => {
    const notificationTime = new Date(dateDebut.getTime() - interval.milliseconds);
    if (notificationTime > currentDate) {
      const cronExpression = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

      cron.schedule(cronExpression, async () => {
        try {
          // Enregistrer la notification dans la base de données
          await this.prismaservice.notification.create({
            data: {
              lu: false,
              idEvenement,
              idUser,
              description: `Your event of type ${type} starts in ${interval.label}.`,
              date_creation: new Date(),
            },
          });

          if (firebaseToken) {
            const message = {
              notification: {
                title: 'Rappel d\'événement',
                body: `Your event of type ${type} starts in ${interval.label}.`,
              },
              token: firebaseToken,
            };

            const response = await admin.messaging().send(message);
            console.log(`Notification envoyée avec succès pour ${interval.label}:`, response);
          } else {
            console.log('Aucun token Firebase disponible.');
          }
        } catch (error) {
          console.error(`Erreur lors de l'envoi de la notification pour ${interval.label}:`, error);
        }
      });
    }
  });
}
}
