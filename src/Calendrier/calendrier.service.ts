import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Calendrier } from './calendrier.model';
import { Category } from 'src/Category/Category';
import { Prisma, calendrier } from '@prisma/client';

@Injectable()
export class CalendrierService {
  constructor(private prismaservice: PrismaService) {}
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
  // Récupérer l'utilisateur associé à l'ID du compte connecté
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

// async getCalendrierById(idEvenement: number|string): Promise<Calendrier|null> {
//   if (typeof idEvenement !== 'number' && typeof idEvenement !== 'string') {
//       throw new Error('Invalid idEvenement type. Expected number or string, received ' + typeof idEvenement);
//   }
  
//   // Si idEvenement est une chaîne, convertissez-la en nombre
//   const eventId = typeof idEvenement === 'string' ? parseInt(idEvenement) : idEvenement;

//   return this.prismaservice.calendrier.findUnique({
//     where: {
//       idEvenement: Number(eventId),
//     },
//   });
// }
async getCalendrierByUserConnecte(userId: number): Promise<Calendrier[]> {
  // Récupérer l'utilisateur
  const user = await this.prismaservice.user.findUnique({
    where: { idUser: Number(userId) },
    include: { roles: true }
  });

  if (!user) {
    throw new Error(`Aucun utilisateur trouvé avec l'ID ${userId}.`);
  }

  
  if (!user.roles ) {
    throw new Error(`L'utilisateur avec l'ID ${userId} n'a pas de rôle associé.`);
  }

  const roleName = user.roles[0].nom_role; 
  const autoEcoleId = user.idAutoEcole;

  if (roleName === 'candidat') {
    
    return await this.prismaservice.calendrier.findMany({
      where: { idUser: Number(userId) }
    });
  } else if (roleName === 'moniteur') {
  
    return await this.prismaservice.calendrier.findMany({
      where: { idMoniteur:Number(userId) }
    });
  }else if (roleName === 'manager') {
    
    return await this.prismaservice.calendrier.findMany({
      where: { idUser: Number(userId) }
    });
  } else if (roleName === 'ecole')  {
    return await this.prismaservice.calendrier.findMany({
      where: { idAutoEcole: Number(autoEcoleId) }
    });
  }
}


async createCalendrier(data: any, idCompteConnecte: number): Promise<Calendrier> {
  const categoryId = await this.getCategoryIdByCategoryName(data.nom_categorie);
  if (!categoryId) {
    throw new Error(`La catégorie "${data.nom_categorie}" n'existe pas.`);
  }
  const connectedUser = await this.prismaservice.user.findUnique({
    where: { idUser: idCompteConnecte }
});
if (!connectedUser || !connectedUser.idAutoEcole) {
    throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
}


const idAutoEcole = connectedUser.idAutoEcole;

  const newCalendrier: Calendrier = {
    idCompteConnecte: idCompteConnecte,
    idCategory: Number(categoryId),
    idUser: Number(data.idUser),
    nom_evenement: data.nom_evenement,
    date_debut: data.date_debut,
    date_fin: data.date_fin,
    description: data.description,
    created_at: data.created_at,
    updated_at: data.updated_at,
    idCars: Number(data.idCars), 
    idMoniteur: Number(data.idMoniteur), 
    idAutoEcole:Number(idAutoEcole)
  };


  return this.prismaservice.calendrier.create({
    data: newCalendrier
  });
}
// async getIdCars(): Promise<number> {
//   // Implémentez la requête pour récupérer l'ID de la voiture avec le statut disponible
//   const car = await this.prismaservice.cars.findFirst({
//     where: {
//       status: true
//     }
//   });

//   if (!car) {
//     throw new Error(`Aucune voiture disponible.`);
//   }

//   return car.id; // Retourne l'ID de la voiture récupérée
// }


// async getIdMoniteur(idConnecte: number): Promise<number> {
//   // Récupérer l'utilisateur connecté avec son rôle
//   const user = await this.prismaservice.user.findUnique({
//     where: { idUser: idConnecte },
//     include: { roles: true }
//   });

//   if (!user || !user.roles) {
//     throw new Error(`Aucun utilisateur trouvé avec l'ID ${idConnecte}.`);
//   }

//   // Vérifier si le rôle de l'utilisateur est "moniteur"
//   const roleName = user.roles[0].nom_role;
//   if (roleName !== 'moniteur') {
//     throw new Error(`L'utilisateur avec l'ID ${idConnecte} n'est pas un moniteur.`);
//   }

//   // Récupérer l'ID de l'auto-école de l'utilisateur connecté
//   const idAutoEcole = user.idAutoEcole;
  
//   // Récupérer l'ID du moniteur associé à la même auto-école que l'utilisateur connecté
//   const moniteur = await this.prismaservice.user.findFirst({
//     where: {
//       idRole: 2, // Supposant que l'ID du rôle "moniteur" est 2
//       idAutoEcole: idAutoEcole
//     }
//   });

//   if (!moniteur) {
//     throw new Error(`Aucun moniteur trouvé associé à l'auto-école avec l'ID ${idAutoEcole}.`);
//   }

//   return moniteur.idUser;
// }




async updateCalendrier(idEvenement:number,data:Calendrier):Promise<Calendrier>{

 
  return this.prismaservice.calendrier.update({
      where:{idEvenement:Number(idEvenement)},
      data:{  ...data,
        idUser: Number(data.idUser), 
        idCars: Number(data.idCars), 
        idMoniteur: Number(data.idMoniteur),
       }
  })
}
async deleteCalendrier(idEvenement:number):Promise<Calendrier>{
  return this.prismaservice.calendrier.delete({
      where:{idEvenement:Number(idEvenement)}
  })
}

}