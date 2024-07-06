import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Forfait } from "./pack.model";
import admin from "src/firebase-admin";
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

    
    async createCustomForfait(forfaitDat: any,userid:number, firebaseToken:any):Promise<Forfait> {
    const forfaitData= forfaitDat.pack

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
              totalCost +=Number(service.tarif) * forfaitData.nombre_sms;
              console.log(' forfaitData.nombre_sms',  forfaitData.nombre_sms)
              console.log('service.tarif.sms', service.tarif)
            } else if (service.service.nom === 'moniteur' && forfaitData.nombre_compte) {
              totalCost += Number(service.tarif) * forfaitData.nombre_compte;
              console.log('service.tarif.moniteur', service.tarif)
              console.log('forfaitData.nombre_compte', forfaitData.nombre_compte)
            }
            else if (service.service.nom === 'historique') {
          
                console.log('service.tarif.historique', service.tarif)
                if (forfaitData.historique== true) {
                    totalCost += Number(service.tarif);
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
   const demande =await this.prismaservice.demande.create({
        data: {
            type: "custom package purchase request",
            idForfait: Number(custom.idForfait),
            statut: "en_attente",
            idUser: Number(userid),
            idAutoecole: userAutoEcole.autoecole[0].id,
            date_creation: currentDate,
        },
    });
   const userss= await this.prismaservice.user.findUnique({
    where:{
      idUser:Number(demande.idUser)
    }, select:{
      nom:true,
      prenom:true
    }
   })
   const notification= await this.prismaservice.notification.create({
      data: {
        lu: false,
        idUser: demande.idUser,
        description: ` ${userss.nom} ${userss.prenom} has sent a request.`,
        date_creation: currentDate,
      },
    });
console.log('forfaitDat.firebaseToken', forfaitDat.firebaseToken)
    // Send Firebase notification if firebaseToken is available
    if (forfaitDat.firebaseToken) {
      const message = {
        notification: {
          title: 'custom_pack',
          body: 'La demande a été envoyer avec succés .',
        },
        token: forfaitDat.firebaseToken,
        data: {
          lu: 'false',
          description: 'The request has been successfully sent.',
          date_creation: this.formatDate(currentDate),
        },
      };
      console.log('notification',notification)
      console.log('message', message);
      const response = await admin.messaging().send(message);
      console.log('Notification envoyée avec succès:', response);
    } else {
      console.log('No Firebase token available.');
    }
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
console.log('custom', custom)
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
                type: "pack purchase request",
                idForfait: Number(packId),
                statut: "en_attente",
                idUser: Number(userId),
                idAutoecole: userAutoEcole.autoecole[0].id,
                date_creation:currentDate
            },
        });
    }
    async accepterDemandePack(demandeId: number, firebaseToken:any): Promise< string> {
        const currentDate = new Date();       
        const demande = await this.prismaservice.demande.findUnique({
            where: { idDemande: Number(demandeId) },
            include: { forfait: true, evenement:true } 
        });
    
        if (!demande) {
            throw new NotFoundException(`La demande avec l'ID ${demandeId} n'existe pas.`);
        }
        
if (demande.type === 'Update date') {
    // Vérification pour le moniteur
    const moniteurCalendrier = await this.prismaservice.calendrier.findMany({
      where: {
        idMoniteur: { equals: Number(demande.evenement.idMoniteur) },
        idEvenement: { not: Number(demande.idEvenement) }
      },
      select: { date_debut: true, date_fin: true }
    });
  
    for (const event of moniteurCalendrier) {
      const eventDateDebut = new Date(event.date_debut);
      const eventDateFin = new Date(event.date_fin);
  
      if (
        (demande.date_debut >= eventDateDebut && demande.date_debut < eventDateFin) ||
        (demande.date_fin > eventDateDebut && demande.date_fin <= eventDateFin) ||
        (demande.date_debut <= eventDateDebut && demande.date_fin >= eventDateFin)
      ) {
        console.log("Le créneau horaire n'est pas disponible pour le moniteur");
        return "Le créneau horaire n'est pas disponible pour le moniteur.";
      }
    }
  
    // Vérification pour la voiture
    const voitureCalendrier = await this.prismaservice.calendrier.findMany({
      where: {
        idVoiture: { equals: Number(demande.evenement.idVoiture) },
        idEvenement: { not: Number(demande.idEvenement) }
      },
      select: { date_debut: true, date_fin: true }
    });
  
    for (const event of voitureCalendrier) {
      const eventDateDebut = new Date(event.date_debut);
      const eventDateFin = new Date(event.date_fin);
  
      if (
        (demande.date_debut >= eventDateDebut && demande.date_debut < eventDateFin) ||
        (demande.date_fin > eventDateDebut && demande.date_fin <= eventDateFin) ||
        (demande.date_debut <= eventDateDebut && demande.date_fin >= eventDateFin)
      ) {
        console.log("Le créneau horaire n'est pas disponible pour la voiture.")
        return "Le créneau horaire n'est pas disponible pour la voiture.";
      }
    }
  
    // Vérification pour le candidat
    const candidatCalendrier = await this.prismaservice.calendrier.findMany({
      where: {
        idUser: { equals: Number(demande.evenement.idUser) },
        idEvenement: { not: Number(demande.idEvenement) }
      },
      select: { date_debut: true, date_fin: true }
    });
  
    for (const event of candidatCalendrier) {
      const eventDateDebut = new Date(event.date_debut);
      const eventDateFin = new Date(event.date_fin);
  
      if (
        (demande.date_debut >= eventDateDebut && demande.date_debut < eventDateFin) ||
        (demande.date_fin > eventDateDebut && demande.date_fin <= eventDateFin) ||
        (demande.date_debut <= eventDateDebut && demande.date_fin >= eventDateFin)
      ) {
        console.log("Le créneau horaire n'est pas disponible pour le candidat.")
        return "Le créneau horaire n'est pas disponible pour le candidat.";
      }
    }

   
    // Si toutes les vérifications sont passées, mettre à jour la demande
    await this.prismaservice.demande.update({
      where: { idDemande: Number(demandeId) },
      data: { statut: 'acceptée' },
    });
  
    // Calcul de la différence en millisecondes
    const differenceMs = demande.evenement.date_fin.getTime() - demande.evenement.date_debut.getTime();
  
    // Convertir la différence en minutes si nécessaire
    if (demande.evenement.type === 'Hour code') {
      const differenceMinutes = differenceMs / (1000 * 60);
  
      // Récupérer les données actuelles du candidat
      const candidatData = await this.prismaservice.condidat.findUnique({
        where: { idCondidat: demande.idUser },
        select: { nombre_heur_code: true },
      });
  
      if (!candidatData) {
        throw new Error(`No candidat found with id ${demande.idUser}.`);
      }
  
      // Calculer le nouveau nombre d'heures de code
      const newNombreHeures = (candidatData.nombre_heur_code || 0) - differenceMinutes;
      const newNombreHeuresCode = Math.round(newNombreHeures);
  
      // Mettre à jour le candidat avec les nouvelles valeurs
      const updatedCondidat = await this.prismaservice.condidat.update({
        where: { idCondidat: demande.idUser },
        data: {
          nombre_heur_code: newNombreHeuresCode,
          
        },
      });
      await this.prismaservice.notification.create({
        data: {
          lu: false,
          idEvenement: demande.evenement.idEvenement,
          idUser: demande.idUser,
          description: `Your ${demande.evenement.type} date has been set from ${demande.evenement.date_debut} to ${demande.evenement.date_fin}.`,
          date_creation: currentDate,
        },
      });

      // Send Firebase notification if firebaseToken is available
      if (firebaseToken.firebaseToken) {
        const message = {
          notification: {
            title: 'demande',
            body: 'Your request has been denied.',
          },
          token: firebaseToken.firebaseToken,
          data: {
            lu: 'false',
            description: 'Your request has been denied.',
            date_creation: this.formatDate(currentDate),
          },
        };
        console.log('message', message);
        const response = await admin.messaging().send(message);
        console.log('Notification envoyée avec succès:', response);
      } else {
        console.log('No Firebase token available.');
      }
      console.log(`Updated candidat: ${JSON.stringify(updatedCondidat)}`);
      const a= await this.prismaservice.condidat.findUnique({
        where:{
          idCondidat:demande.idUser
        },
        select:{
      
          autoecole:{
            select:{
              id:true,
              sms:true
            }
          }
        }
      })
const updatesms= Number(a.autoecole.sms)-1
      const autEcole= await this.prismaservice.autoecole.update({
        where:{
          id: Number(a.autoecole.id)
        },
        data:{
          sms: Number(updatesms)
    
        }
      })
      return "La demande a été acceptée avec succès.";
    }
  }
  


        const demandeecole = demande.idAutoecole
    
        console.log('ID de l\'auto-école  :', demandeecole);
        const autoEcole = await this.prismaservice.autoecole.findUnique({
            where: { id: Number(demandeecole) }
        });
        if (!autoEcole) {
            throw new NotFoundException(`Auto-école non trouvée.`);
        }
        if(demande.forfait.historique=== true){
          autoEcole.temp_historique.setFullYear(autoEcole.temp_historique.getFullYear() + 1);
      }else {
        autoEcole.temp_historique
      }
        const nouveauNombreSms = autoEcole.sms + demande.forfait.nombre_sms;
        const nouveauNombrecompte = autoEcole.moniteurs + demande.forfait.nombre_compte;
        console.log("nouveauNombreSms",nouveauNombreSms)
    
        await this.prismaservice.autoecole.update({
            where: { id: Number(demandeecole) },
            data: {
                sms: nouveauNombreSms,
                moniteurs:nouveauNombrecompte,
                temp_historique: autoEcole.temp_historique
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
        await this.prismaservice.notification.create({
            data: {
              lu: false,
              idUser: demande.idUser,
              description: 'Your request has been accepted.',
              date_creation: currentDate,
            },
          });
    
          // Send Firebase notification if firebaseToken is available
          if (firebaseToken.firebaseToken) {
            const message = {
              notification: {
                title: 'demande',
                body: 'Your request has been accepted.',
              },
              token: firebaseToken.firebaseToken,
              data: {
                lu: 'false',
                description: 'Your request has been accepted.',
                date_creation: this.formatDate(currentDate),
              },
            };
    
            const response = await admin.messaging().send(message);
            console.log('Notification envoyée avec succès:', response);
          } else {
            console.log('No Firebase token available.');
          }
        return "La demande a été acceptée avec succès.";
    }
    
    async refuserDemandePack(demandeId: number, firebaseToken:any): Promise<string> {
        const currentDate = new Date();       

        const demande = await this.prismaservice.demande.findUnique({
            where: { idDemande: Number(demandeId) },
            include: { forfait: true } 
        });
    
        if (!demande) {
            throw new NotFoundException(`La demande avec l'ID ${demandeId} n'existe pas.`);
        }
        if (demande.type === 'Update date') {
           
            await this.prismaservice.demande.update({
              where: { idDemande: Number(demandeId) },
              data: { statut: 'refusé' },
            });
            return;
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
        // Create a notification
     const not= await this.prismaservice.notification.create({
        data: {
          lu: false,
          idUser: demande.idUser,
          description: 'Your request has been denied.',
          date_creation: currentDate,
        },
      });
console.log('firebaseToken', firebaseToken.firebaseToken)
      // Send Firebase notification if firebaseToken is available
      if (firebaseToken.firebaseToken) {
        const message = {
          notification: {
            title: 'demande',
            body: 'Your request has been denied',
          },
          token: firebaseToken.firebaseToken,
          data: {
            lu: 'false',
            description: 'Your request has been denied',
            date_creation: this.formatDate(currentDate),
          },
        };

        const response = await admin.messaging().send(message);
       console.log('notif', not)
        console.log('Notification envoyée avec succès:', response);
      } else {
        console.log('No Firebase token available.');
      }
        return "La demande a été refusé avec succès.";
    }


    async createDemande(idUser: number, data: any): Promise<any> {
        const currentDate = new Date();
      
        // Supposons que data.event contienne les informations de l'événement
        const { idEvenement, date_debut, date_fin } = data.event;
        
        if (!idEvenement) {
            throw new Error("idEvenement est nécessaire.");
        }
      
        const event = await this.prismaservice.calendrier.findUnique({
            where: {
                idEvenement: Number(idEvenement),
            },
            select: {
                autoecole: true,
                user: true,
                idAutoEcole: true
            }
        });
    
        if (!event) {
            throw new Error(`L'événement avec l'ID ${idEvenement} n'existe pas.`);
        }
        let dateDebut = new Date(date_debut);
    let dateFin = new Date(date_fin);

    // Ajouter 2 heures à dateDebut
    dateDebut.setHours(dateDebut.getHours() + 2);
        // Ajouter 2 heures à dateDebut
        dateFin.setHours(dateDebut.getHours() + 2);
        return this.prismaservice.demande.create({
            data: {
                type: 'Update date',
                idEvenement: Number(idEvenement),
                statut: 'en_attente',
                idUser: Number(idUser),
                idAutoecole: Number(event.idAutoEcole), // Assurez-vous que c'est un nombre
                date_creation: currentDate,
                date_debut: new Date(date_debut),
                date_fin: new Date(date_fin),
            },
        });
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
    
}