import { PrismaService } from "src/prisma/prisma.service";
import { User } from "./user.model";
import { role } from "./role.model";
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, voitures, condidat, moniteur, permi, user, contrat } from "@prisma/client";
import * as path from 'path';
import * as fs from 'fs';
import { Twilio } from 'twilio';
import * as bcrypt from 'bcrypt'
import { UpdatePasswordWithOTPDto } from "src/auth/dto";
import admin from "src/firebase-admin";
import { NotificationService } from "../notification/NotificationService";
import { where } from "sequelize";
import { Decimal } from "@prisma/client/runtime";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
export interface ForfaitStatistique {
  mois: string;
  total: number;
}
@Injectable()
export class UserService{
    private readonly logger = new Logger(UserService.name);
    private twilioClient: Twilio;
    constructor(private prismaservice:PrismaService, private readonly notificationService: NotificationService){ 
        this.twilioClient = new Twilio('ACb75e5dd7011e2263abacf1201a5f7e9e', 'da13b20c0cae5f0eaf50a336bbf81206');
    }
    private async sendSMS(phoneNumber: string, message: string): Promise<void> {
      try {
        phoneNumber = `+216${phoneNumber}`;
        const response = await this.twilioClient.messages.create({
          body: message,
          from: '+13149382644',
          to: phoneNumber,
        });
  
        console.log('SMS Sent successfully:', response.sid);
      } catch (error) {
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send SMS');
      }
    }
      // private async sendSMS(phoneNumber: string, message: string): Promise<void> {
      //   try {
      //     const response = await this.twilioClient.messages.create({
      //       body: message,
      //       from: '+13149382644',
      //       to: phoneNumber,
      //     });
    
      //     console.log('SMS Sent successfully:', response.sid);
      //   } catch (error) {
      //     console.error('Error sending SMS:', error);
      //   }
      // }
      async generateAndSendOTP(idUser: number): Promise<void> {
        try {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          console.log('otp', otp)
          const user = await this.prismaservice.user.findUnique({
            where: { idUser },
          });
          const phone = user?.numero_telephone1;
          if (!user || !phone) {
            throw new Error('User not found or phone number not provided.');
          }
          const formattedPhone = `+216${phone}`;
     
          await this.sendsSMS(formattedPhone, otp);
    
          await this.prismaservice.user.update({
            where: { idUser },
            data: { otp },
          });
        } catch (error) {
          console.error('Error generating and sending OTP:', error);
          throw new Error('Failed to generate and send OTP.');
        }
      }
      async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        console.log('hashedPassword', hashedPassword)
        console.log('plainPassword', plainPassword)
         return plainPassword === hashedPassword;
       }
  async updatePasswordWithOTP(dto: UpdatePasswordWithOTPDto): Promise<void> {
    const { idUser, oldPassword, newPassword, newPasswordConfirm, otp } = dto;
console.log('dto', dto)
    try {
        const user = await this.prismaservice.user.findUnique({
            where: { idUser },
          });
          console.log('otpuser', user.otp)
    const isOTPValid = await this.validateOTP(idUser, otp);
    console.log('isOTPValid', isOTPValid)
    if (!isOTPValid) {
      throw new Error('Invalid OTP.');
    }

    // Vérifier si l'ancien mot de passe correspond
   
    if (!user) {
      throw new Error('User not found.');
    }
    console.log('...', user.password)
    console.log('dfg', oldPassword)
    const cleanedPlainPassword = oldPassword.trim();
    const cleanedHashedPassword = user.password.trim();

    console.log('Plain Password:', cleanedPlainPassword);
    console.log('Hashed Password in Database:', cleanedHashedPassword);
    const passwordMatches = await this.comparePasswords(cleanedPlainPassword, cleanedHashedPassword);
    if (!passwordMatches) {
      throw new Error('Old password is incorrect.');
    }

    // Valider que les nouveaux mots de passe correspondent
    if (newPassword !== newPasswordConfirm) {
      throw new Error('New passwords do not match.');
    }

    // Mettre à jour le mot de passe de l'utilisateur
    const hashedPassword = await this.hashPassword(newPassword);
    await this.updatePassword(idUser, hashedPassword, newPassword);

    // Effacer l'OTP après utilisation
    await this.prismaservice.user.update({
      where: { idUser },
      data: { otp: null },
    });
 } catch (error) {
        this.logger.error(`Failed to update password with OTP: ${error.message}`, error.stack);
        throw new Error('Failed to update password with OTP.');
      }
  }

  async validateOTP(idUser: number, otp: string): Promise<boolean> {
    const user = await this.prismaservice.user.findUnique({
      where: { idUser },
    });
    if (!user || !user.otp) {
      return false;
    }
    return user.otp === otp;
  }

  async updatePassword(idUser: number, hashedPassword: string, newPassword: string): Promise<void> {
    await this.prismaservice.user.update({
      where: { idUser },
      data: {
        hash:hashedPassword,
        password: newPassword },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }
    
 
  private async sendsSMS(phoneNumber: string, otp: string): Promise<void> {
    try {
      const message = `Your OTP is ${otp}`;
      const response = await this.twilioClient.messages.create({
        body: message,
        from: '+13149382644',
        to: phoneNumber,
      });

      console.log('SMS Sent successfully:', response.sid);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new Error('Failed to send SMS.');
    }
  }
  async forgetPassword(username: string): Promise<string | null> {
    console.log('username25', username);
    const user = await this.prismaservice.user.findUnique({
      where: { username: username },
    });

    if (!user) {
      throw new Error('User not found.');
    }
    const tel= user.numero_telephone1
    const password = user.password;
    console.log('tel', tel)
    await this.sendSMS(tel, `Your  Password: ${password}`);
    return password;
  }
 
  async createUser(data: any, idCompteConnecte: number): Promise<User> {
    const roles = await this.getRoleIdByRoleName(data.emploi);
    const currentDate = new Date();
    const connectedUser = await this.prismaservice.gerantecole.findUnique({
      where: { idGerant: Number(idCompteConnecte) },
      select: {
        autoecole: true,
      },
    });
  
    if (!connectedUser || !connectedUser.autoecole[0]?.id) {
      throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
    }
  
    const idAutoEcole = Number(connectedUser.autoecole[0].id);
    const autoEcole = connectedUser.autoecole[0].nom;
    const candidatautoEcole = connectedUser.autoecole[0].candidats;
  
    const randomPart = this.generateRandomString(4);
    const username = `${autoEcole}.${randomPart}`;
    const password = this.generateRandomPassword(8);
  
    const userData = {
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      firebaseToken: data.firebaseToken,
      numero_telephone1: data.numero_telephone1,
      numero_telephone2: data.numero_telephone2,
      genre: data.genre,
      emploi: data.emploi,
      adresse: data.adresse,
      idAutoEcole: idAutoEcole,
      password: password,
      username: username,
      idRole: Number(roles),
      date_creation: currentDate,
    };
  
    if (data.emploi === 'candidat') {
      // Find the type of permit based on data.idPermi
      const permi = await this.prismaservice.permi.findFirst({
        where: {
          idPermi: Number(data.idPermi),
        },
        select: {
          type: true,
        },
      });

      const typepermis = permi?.type;

      // Create a new user
      const createdUser = await this.prismaservice.user.create({
        data: userData,
      });
      console.log('Created User:', createdUser);
      await this.sendSMS(data.numero_telephone1, `Your account has been created. Your username: ${username} and your password: ${password}. Please keep this information secure.`);
      // Create a new condidat
   
      const createdCondidat = await this.prismaservice.condidat.create({
        data: {
          date_creation: currentDate,
          idCondidat: createdUser.idUser, // Use created user's id
          idAutoecole: Number(idAutoEcole),
        },
      });
console.log('condidat', createdCondidat)
      // Create a new paiement
     

      // Increment candidats count in autoecole
      const autoEcole = await this.prismaservice.autoecole.findUnique({
        where: { id: Number(idAutoEcole) },
      });
      const updatedCandidats = autoEcole.candidats + 1;
      const updatedSms = autoEcole.sms - 1;
      const autoEcoleUpdated = await this.prismaservice.autoecole.update({
        where: { id: Number(idAutoEcole) },
        data: { candidats: updatedCandidats,
          sms:updatedSms
        },
      });
console.log('candidats', autoEcoleUpdated.candidats)
      // If condidat created successfully, create a new contrat
      await this.prismaservice.contrat.create({
        data: {
          idAutoEcole: Number(idAutoEcole),
          idPermi: Number(data.idPermi),
          statut: 'active', // or another appropriate status
          date_creation: currentDate,
          idCondidat: createdUser.idUser,
        },
      });

      // Create a notification
      await this.prismaservice.notification.create({
        data: {
          lu: false,
          idUser: createdUser.idUser,
          description: 'Your account has been successfully activated.',
          date_creation: currentDate,
        },
      });

      // Send Firebase notification if firebaseToken is available
      if (data.firebaseToken) {
        const message = {
          notification: {
            title: 'Compte Activé',
            body: 'Your account has been successfully activated.',
          },
          token: data.firebaseToken,
          data: {
            lu: 'false',
            description: 'Your account has been successfully activated.',
            date_creation: this.formatDate(currentDate),
          },
        };

        const response = await admin.messaging().send(message);
        console.log('Notification envoyée avec succès:', response);
      } else {
        console.log('No Firebase token available.');
      }

      return createdUser; // Return the created user object
    } else if (data.emploi === 'moniteur') {
      const autoEcole = await this.prismaservice.autoecole.findUnique({
        where: { id: Number(idAutoEcole) },
        select: { moniteurs: true },
      });
  
      const moniteursDisponibles = Number(autoEcole?.moniteurs) || 0;
  
      if (moniteursDisponibles > 0) {
        const createdUser = await this.prismaservice.user.create({
          data: userData,
        });
  
        await this.prismaservice.moniteur.create({
          data: {
            date_creation: currentDate,
            idMoniteur: Number(createdUser.idUser),
            idAutoecole: Number(idAutoEcole),
          },
        });
  
        await this.prismaservice.autoecole.update({
          where: { id: Number(idAutoEcole) },
          data: { moniteurs: moniteursDisponibles - 1 },
        });
  
        // Enregistrer la notification dans MySQL
        await this.prismaservice.notification.create({
          data: {
            lu: false,
            idUser: createdUser.idUser,
            description: 'Your account has been successfully activated.',
            date_creation:currentDate,
          },
        });
  
        // Envoyer la notification Firebase
        if (data.firebaseToken) {
          const message = {
            notification: {
              title: 'Compte Activé',
              body: 'Your account has been successfully activated.',
            },
            token: data.firebaseToken,
            data: {
              lu: 'false',
              description: 'Your account has been successfully activated.',
              date_creation: this.formatDate(currentDate),
            },
          };
  
          try {
            const response = await admin.messaging().send(message);
            console.log('Notification envoyée avec succès:', response);
            // Retourner une confirmation ou effectuer d'autres actions si nécessaire
          } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            throw new Error('Erreur lors de l\'envoi de la notification Firebase');
          }
        } else {
          console.log('No Firebase token available.');
        }
  
        return createdUser;
      } else {
        throw new Error(`Achetez des comptes pour l'auto-école avant de créer un nouveau moniteur.`);
      }
    }
  }

      async updateUserToken(userId: string, token: string) {
        return this.prismaservice.user.update({
          where: { idUser: Number(userId) },
          data: { firebaseToken: token },
        });
      }
    async getRoleIdByRoleName(roleName: string): Promise<number | null> {
        const role = await this.prismaservice.roles.findFirst({
          where: { nom_role: roleName },
          select: { idRole: true },
        });
        return role ? role.idRole : null;
      }
    async getAllUser(idCompteConnecte: number):Promise<User[]>{
        return await this.prismaservice.user.findMany({
            where: {
                // numero_compte: idCompteConnecte.toString()
             } }
        )
    }
   
    async getUserById(idUser: number): Promise<User | null> {
      if (typeof idUser !== 'number') {
        throw new Error('Invalid idUser type. Expected number, received ' + typeof idUser);
      }
      const users = await this.prismaservice.user.findUnique(
        {where: {
        idUser: idUser},
      select:{ 
        idRole:true
      }})
      const role= users.idRole
    if(role===3){
      const user = await this.prismaservice.user.findUnique({
      where: {
        idUser: idUser,
      },
      include: {
        condidat: {
          include: {
            contrats: {
              orderBy: {
                date_creation: 'desc'
              },
              take: 1,
              include: {
                permi: true
              }
            }
          }
        },
      }
    });
    return user;
    
  }
  if(role===2 || role === 4){const user = await this.prismaservice.user.findUnique({
    where: {
      idUser: idUser,
    },
   
  });
  return user;
  }  
}
private async getRoleName(roleId: number): Promise<string> {
    
    const role = await this.prismaservice.roles.findUnique({
        where: { idRole: Number(roleId) },
        select: { nom_role: true },
    });

    if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return role.nom_role;
}

 async saveAvatar(base64Data: string): Promise<string> {
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    const avatarDirectory = path.join(__dirname, '..', 'assets');
    const avatarName = `avatar_${Date.now()}.png`;
    const avatarPath = path.join(avatarDirectory, avatarName);

    if (!fs.existsSync(avatarDirectory)) {
      fs.mkdirSync(avatarDirectory, { recursive: true });
    }
  
    fs.writeFileSync(avatarPath, buffer);
    console.log('Avatar saved:', avatarName);

    return avatarName; 
  }
  private fileToBase64(filePath: string): string {
    // Read file from file system
    const fileData = fs.readFileSync(filePath);

    // Convert file data to base64 format
    const base64Data = Buffer.from(fileData).toString('base64');

    return `data:image/png;base64,${base64Data}`;
  }
  generateRandomPassword(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
  }
  generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    return randomString;
  }
  async getAllUsersByAutoEcoleId(userId: number, roleId:string): Promise<User[]> {
    const role=await this.prismaservice.roles.findUnique({
        where:{
            idRole:parseInt(roleId)
        }
    })
    const role_name= role.nom_role;
    if (role_name==='manager'){
        const ecoleRoleId = await this.getRoleIdByRoleName('ecole');
  
        const users = await this.prismaservice.user.findMany({
            where: {
                idRole: Number(ecoleRoleId) 
            }
        });
        return users;
    } else if (role_name==='ecole'){
        const user = await this.prismaservice.gerantecole.findUnique({
            where: {
                idGerant: Number(userId) 
            },
            select:{
                autoecole: true,
            }
        });
        const idautoecole= user.autoecole[0].id
        const auto =await this.prismaservice.condidat.findMany({
            where:{
                idAutoecole:Number(idautoecole)
            }, 
            include: {
                        contrats: {
                          orderBy: {
                            date_creation: 'desc'
                          },
                          take: 1,
              
                          include:{
                          permi: true  
                  }
              }
          }    
        })
        const candidatIds = auto.map(candidat => candidat.idCondidat);
        const moniteurs = await this.prismaservice.moniteur.findMany({
            where: {
                idAutoecole: Number(idautoecole)
            }
        });
        
        const moniteurIds = moniteurs.map(moniteur => moniteur.idMoniteur);
    
    
        const users = await this.prismaservice.user.findMany({
           
                where: {
                    OR: [
                        { idUser: { in: candidatIds } },
                        { idUser: { in: moniteurIds } }
                    ]
                
            },include: {
              condidat: {
                  include: {
                      contrats: {
                        orderBy: {
                          date_creation: 'desc'
                        },
                        take: 1,
            
                          include: {
                              permi: true
                          }
                      }
                  }
              },   moniteur: true // Inclure les moniteurs
            }
          });
    
        return users;
        
    }
}
async getAllUsersByAutoEcoleIdAndRole(role: string, userId: number): Promise<User[]> {
    
    const connectedUser = await this.prismaservice.user.findUnique({
        where: { idUser: Number(userId) }
    });
    if (!connectedUser || !connectedUser.idAutoEcole) {
        throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
    }

    
    const idAutoEcole = Number(connectedUser.idAutoEcole);

    const roleData = await this.prismaservice.roles.findFirst({
        where: { nom_role: role  }
    });
    if (!roleData || !roleData.idRole) {
        throw new Error(`Impossible de récupérer l'ID du rôle "${role}".`);
    }


    const users = await this.prismaservice.user.findMany({
        where: { 
            idAutoEcole,
            idRole: roleData.idRole
        },include:{
          condidat:{
          include:{contrats:true}
          }
        }
    });
    // Post-processing to select only the most recent contract for each user
 // Post-processing to select only the most recent contract for each user
 const usersWithLatestContrat = users.map(user => {
  if (user.condidat && user.condidat.contrats.length > 0) {
      user.condidat.contrats.sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
      user.condidat.contrats = [user.condidat.contrats[0]]; // Keep only the most recent contract
  }
  return user;
});
console.log('users', usersWithLatestContrat)
return usersWithLatestContrat;

  
}    


async updateUser(idUser: number, userData: any): Promise<User> {
  console.log(`Updating user with ID: ${idUser}`);
  console.log(`User data: ${JSON.stringify(userData)}`);
  try {
    // Vérifiez si l'utilisateur existe
    const existingUser = await this.prismaservice.user.findUnique({
      where: { idUser: idUser },
    });

    if (!existingUser) {
      throw new Error(`User with id ${idUser} does not exist.`);
    }

    console.log(`User exists, proceeding with update for id: ${idUser}`);

    // Vérifiez si le username existe déjà, mais ignorez si c'est le même utilisateur
    if (userData.username && userData.username !== existingUser.username) {
      const existingUsernameUser = await this.prismaservice.user.findFirst({
        where: {
          username: userData.username,
          idUser: {
            not: idUser, // Exclure l'utilisateur actuel
          },
        },
      });

      if (existingUsernameUser) {
        throw new Error(`Username ${userData.username} is already taken.`);
      }
    }

    // Mettre à jour les informations de l'utilisateur
    const updatedUser = await this.prismaservice.user.update({
      where: { idUser: idUser },
      data: {
        nom: userData.nom,
        prenom: userData.prenom,
        email: userData.email,
        numero_telephone1: userData.numero_telephone1,
        numero_telephone2: userData.numero_telephone2,
        adresse: userData.adresse,
        cin: userData.cin,
        description: userData.description,
        avatar: userData.avatar,
        username: userData.username,
        nombre_fois_code: parseInt(userData.nombre_fois_code) || 0,
        nombre_fois_conduit: parseInt(userData.nombre_fois_conduit) || 0,
      },
    });

    console.log(`Updated user: ${JSON.stringify(updatedUser)}`);

//     // Récupérer l'idContrat du dernier contrat du condidat
// const condidat = await this.prismaservice.condidat.findUnique({
//   where: { idCondidat: idUser },
//   include: {
//     contrats: {
//       orderBy: {
//         date_creation: 'desc'
//       },
//       take: 1,
//       select: {
//         idContrat: true
//       }
//     }
//   }
// });

// if (!condidat || !condidat.contrats || !condidat.contrats[0]) {
//   throw new Error(`No condidat found with id ${idUser}.`);
// }

// const idContrat = condidat.contrats[0].idContrat;


    // // Récupérer l'idPermi du contrat associé au condidat
    // const contrat = await this.prismaservice.contrat.findUnique({
    //   where: { idContrat: condidat.idContrat },
    //   select: { idPermi: true },
    // });

    // if (!contrat) {
    //   throw new Error(`No contrat found with id ${condidat.idContrat}.`);
    // }
    const contrat = await this.prismaservice.condidat.findUnique({
      where: { idCondidat: idUser },
      include: {
        contrats: {
          orderBy: {
            date_creation: 'desc'
          },
          take: 1
        }
      }
    });
    if (!contrat || !contrat.contrats || contrat.contrats.length === 0) {
      throw new Error(`No contract found for condidat with id ${idUser}`);
    }
    const contrats = await this.prismaservice.contrat.findUnique({
      where: { idContrat: contrat.contrats[0].idContrat },
      select: { idPermi: true },
    });
    
    if (!contrat) {
      throw new Error(`No contrat found with id ${contrat.contrats[0].idContrat}`);
    }
    const idPermi = contrats.idPermi;
    // Récupérer l'idPermi associé au type de permis dans userData
    const permi = await this.prismaservice.permi.findFirst({
      where: { type: userData.permi },
      select: { idPermi: true },
    });
console.log('userData.permi', userData.permi)
    if (!permi) {
      throw new Error(`No permi found with type ${userData.permi}.`);
    }

    // Comparer les idPermi pour voir s'ils sont différents
    if (permi.idPermi !== contrats.idPermi) {
      console.log('permi.idPermi', permi.idPermi)
      console.log('contrat.idPermi', contrats.idPermi)
      // Mettre à jour le modèle condidat avec les champs total_prix_code et total_prix_conduit
      if (userData.total_prix_code !== undefined || userData.total_prix_conduit !== undefined) {
        // Récupérer les données actuelles du condidat
        const condidatData = await this.prismaservice.condidat.findUnique({
          where: { idCondidat: idUser },
          select: { total_prix_code: true, total_prix_conduit: true },
        });

        // Calculer les nouvelles valeurs
        const newTotalPrixCode = (parseInt(userData.total_prix_code) );
        const newTotalPrixConduit = (parseInt(userData.total_prix_conduit) );

        // Mettre à jour le condidat avec les nouvelles valeurs
      
        const condidate = await this.prismaservice.condidat.findUnique({
          where: { idCondidat: idUser },
          include: {
            contrats: {
              select: {
                idContrat: true
              },
              orderBy: {
                date_creation: 'desc'
              },
              take: 2 // Récupérer seulement le premier contrat
            }
          }
        });
        
        if (!condidate || !condidate.contrats ) {
          throw new Error(`No contract found for condidat with id ${idUser}`);
        }
        
        // const idContrat = condidate.contrats[1].idContrat;
        // const condidat = await this.prismaservice.contrat.update({
        //   where: { idContrat: idContrat },
        //   data: { statut: 'inactive', },
        // });
        const condidats = await this.prismaservice.condidat.findUnique({
          where: { idCondidat: idUser },
          select: { idAutoecole:true },
        });
        const currentDate = new Date();
        const cont= await this.prismaservice.contrat.create({
          data: {
              idAutoEcole: Number(condidats.idAutoecole),
              idPermi: Number(permi.idPermi),
              statut: 'active', // ou un autre statut approprié
              date_creation: currentDate,
              idCondidat:idUser
          },
      }); 
       // Créer un nouveau paiement pour total_prix_code
     if (userData.total_prix_code !== undefined) {
      await this.prismaservice.paiement.create({
        data: {
          // idCondidat: idUser,
          idContrat: cont.idContrat,
          incrementType: 'code',
          incrementValue: parseInt(userData.total_prix_code),
          date_creation:currentDate
        },
      });
    }

    // Créer un nouveau paiement pour total_prix_conduit
    if (userData.total_prix_conduit !== undefined) {
      await this.prismaservice.paiement.create({
        data: {
          // idCondidat: idUser,
          idContrat: cont.idContrat,
          incrementType: 'conduit',
          incrementValue: parseInt(userData.total_prix_conduit),
          date_creation:currentDate
        },
      });
    }
      const updatedCondidat = await this.prismaservice.condidat.update({
        where: { idCondidat: idUser },
        data: {
          total_prix_code: newTotalPrixCode,
          total_prix_conduit: newTotalPrixConduit,
       
        },
      });
        console.log(`Updated condidat: ${JSON.stringify(updatedCondidat)}`);
      }
    }
    else {
      console.log('permi.idPermi', permi.idPermi)
      console.log('contrat.idPermi', contrats.idPermi)
      // Mettre à jour le modèle condidat avec les champs total_prix_code et total_prix_conduit
      if (userData.total_prix_code !== undefined || userData.total_prix_conduit !== undefined) {
        // Récupérer les données actuelles du condidat
        const condidatData = await this.prismaservice.condidat.findUnique({
          where: { idCondidat: idUser },
          select: { total_prix_code: true, total_prix_conduit: true },
        });

        // Calculer les nouvelles valeurs
        const newTotalPrixCode = (condidatData.total_prix_code || 0) + (parseInt(userData.total_prix_code) || 0);
        const newTotalPrixConduit = (condidatData.total_prix_conduit || 0) + (parseInt(userData.total_prix_conduit) || 0);

        // Mettre à jour le condidat avec les nouvelles valeurs
        const updatedCondidat = await this.prismaservice.condidat.update({
          where: { idCondidat: idUser },
          data: {
            total_prix_code: newTotalPrixCode,
            total_prix_conduit: newTotalPrixConduit,
          },
        });
 // Récupérer le dernier contrat pour ce condidat (idUser)
 const lastContrat = await this.prismaservice.contrat.findFirst({
  where: { idCondidat: idUser },
  orderBy: { date_creation: 'desc' },
});

if (!lastContrat) {
  throw new Error(`No contract found for condidat with id ${idUser}`);
}
console.log('lastcontrat', lastContrat )
const currentDate = new Date();
     // Créer un nouveau paiement pour total_prix_code
     if (userData.total_prix_code !== undefined) {
      await this.prismaservice.paiement.create({
        data: {
          // idCondidat: idUser,
          idContrat: lastContrat.idContrat,
          incrementType: 'code',
          incrementValue: parseInt(userData.total_prix_code),
          date_creation:currentDate
        },
      });
    }

    // Créer un nouveau paiement pour total_prix_conduit
    if (userData.total_prix_conduit !== undefined) {
      await this.prismaservice.paiement.create({
        data: {
          // idCondidat: idUser,
          idContrat: lastContrat.idContrat,
          incrementType: 'conduit',
          incrementValue: parseInt(userData.total_prix_conduit),
          date_creation:currentDate
        },
      });
    }
        console.log(`Updated condidat: ${JSON.stringify(updatedCondidat)}`);
      }
    }
    return updatedUser;
  } catch (error) {
    console.error(`Error updating user: ${error.message}`);
    throw error;
  }
}


    async deleteUser(idUser: number): Promise<User> {
        const role = await this.prismaservice.user.findUnique({
            where: {
                idUser: Number(idUser)
            },
            select: {
                idRole: true
            }
        });
    
        const roleId = role.idRole;
    
        const roleName = await this.prismaservice.roles.findUnique({
            where: {
                idRole: Number(roleId)
            },
            select: {
                nom_role: true
            }
        });
    
        if (roleName.nom_role === 'candidat') {
            await this.prismaservice.condidat.delete({
                where: { idCondidat: Number(idUser) }
            });
        } else if (roleName.nom_role === 'ecole') {
            await this.prismaservice.gerantecole.delete({
                where: { idGerant: Number(idUser) }
            });
        } else if (roleName.nom_role === 'moniteur') {
            await this.prismaservice.moniteur.delete({
                where: { idMoniteur: Number(idUser) }
            });
        }
    
        return this.prismaservice.user.delete({
            where: { idUser: Number(idUser) }
        });
    }  
    async getMoniteur(idUser: number): Promise<moniteur[]> {
        const connectedUser = await this.prismaservice.gerantecole.findUnique({
            where: { idGerant: Number(idUser )}, 
            select: {
                autoecole: true,
            },
            
        });
  
        if (!connectedUser || !connectedUser.autoecole[0].id) {
            throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
        }
    
        const idAutoEcole =Number( connectedUser.autoecole[0].id);
        const moniteur= await this.prismaservice.moniteur.findMany({
            where:{
                idAutoecole:Number(idAutoEcole)
            },
            select: {
              idMoniteur: true,
              idAutoecole: true,
              statut: true,
              date_creation: true,
              user: true,
            },
        })
        return moniteur;
      }
      async getCandidat(idUser: number): Promise<condidat[]> {
        const connectedUser = await this.prismaservice.gerantecole.findUnique({
            where: { idGerant: Number(idUser )}, 
            select: {
                autoecole: true,
               
            },
        });
  
        if (!connectedUser || !connectedUser.autoecole[0].id) {
            throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
        }
    
        const idAutoEcole =Number( connectedUser.autoecole[0].id);
        const candidat= await this.prismaservice.condidat.findMany({
            where:{
                idAutoecole:Number(idAutoEcole)
            },
            select: {
              nombre_heur_code:true,
              nombre_heur_conduit:true,
              total_prix_code:true,
              total_prix_conduit:true,
            
              idCondidat: true,
              idAutoecole: true,
              nombre_fois_conduit: true,
              nombre_fois_code: true,
              date_creation: true,
              user: true,
            },
        })
        return candidat;
      }
      async getPermi(): Promise<permi[]> {
        return await this.prismaservice.permi.findMany(); 
      }
    
//       async getCondidatById(id: number, role: number): Promise<any> {
//        if (role === 1) {
//   const autoecoles = await this.prismaservice.autoecole.findMany({
//     select: {
//       demande: {
//         select: {
//           forfait: {
//             select: {
//               prix: true,
//             },
//           },
//           date_creation: true,
//         },
//       },
//     },
//   });

//   // Initialize an object to store the total prices by month
//   const totalsByMonth: { [key: string]: Decimal } = {};

//   // Iterate through each autoecole's demands
//   autoecoles.forEach(autoecole => {
//     autoecole.demande.forEach(demande => {
//       const month = new Date(demande.date_creation).toLocaleString('default', { year: 'numeric', month: '2-digit' });
//       const forfaitPrice = new Decimal(demande.forfait.prix);

//       if (totalsByMonth[month]) {
//         totalsByMonth[month] = totalsByMonth[month].plus(forfaitPrice);
//       } else {
//         totalsByMonth[month] = forfaitPrice;
//       }
//     });
//   });

//   // Convert totalsByMonth to a simpler object with number values
//   const totalsByMonthNumber: { [key: string]: number } = {};
//   for (const month in totalsByMonth) {
//     totalsByMonthNumber[month] = totalsByMonth[month].toNumber();
//   }

//   return totalsByMonthNumber;
// }
// else if (role === 2) {
//   const ecole = await this.prismaservice.autoecole.findFirst({
//     where: {
//       idUser: id
//     },
//     select: {
//       id: true
//     }
//   });

//   if (!ecole) {
//     throw new NotFoundException(`Auto-école with user ID ${id} not found`);
//   }

//   const condidats = await this.prismaservice.condidat.findMany({
//     where: {
//       idAutoecole: ecole.id
//     },
//     include: {
//       paiement_condidatTopaiement_idCondidat: true // Include paiement relation
//     }
//   });

//   if (!condidats || condidats.length === 0) {
//     throw new NotFoundException(`No condidats found for auto-école with ID ${ecole.id}`);
//   }

//   // Initialize total payments object
//   const totalPaiementsParMois: Record<string, number> = {};

//   // Iterate over each condidat and calculate total payments
//   condidats.forEach(condidat => {
//     const paiements = condidat.paiement_condidatTopaiement_idCondidat;
//     paiements.forEach(paiement => {
//       const dateCreation = new Date(paiement.date_creation);
//       const moisAnnee = `${dateCreation.getMonth() + 1}-${dateCreation.getFullYear()}`;
  
//       if (!totalPaiementsParMois[moisAnnee]) {
//         totalPaiementsParMois[moisAnnee] = 0;
//       }
  
//       totalPaiementsParMois[moisAnnee] += paiement.incrementValue || 0;
//     });
//   });

//   return {
//     autoecole: ecole,
//     totalPaiementsParMois,
//     condidats
//   };
// }
//         else if (role === 3) {
//           const condidat = await this.prismaservice.condidat.findUnique({
//             where: { idCondidat: id },
//             include: { paiement_condidatTopaiement_idCondidat: true }, // Ensure paiement relation is included
//           });
      
//           if (!condidat) {
//             throw new NotFoundException(`Condidat with ID ${id} not found`);
//           }
      
//           // Retrieve paiements from the condidat object
//           const paiements = condidat.paiement_condidatTopaiement_idCondidat;
      
//           // Pass the array of paiements to the function
//           const totalPaiementsParMois = this.calculateTotalPaymentsByMonth(paiements);
      
//           return {
//             condidat,
//             totalPaiementsParMois,
//           };
//         } else if (role === 4) {
//           throw new BadRequestException('Aucune donnée disponible');
//         }
//       }
      
      // Méthode pour calculer le total des paiements par mois
      // private calculateTotalPaymentsByMonth(paiements: any[]): Record<string, number> {
      //   const totalPaiementsParMois: Record<string, number> = {};
      
      //   paiements.forEach(paiement => {
      //     const dateCreation = new Date(paiement.date_creation);
      //     const moisAnnee = `${dateCreation.getMonth() + 1}-${dateCreation.getFullYear()}`;
      
      //     if (!totalPaiementsParMois[moisAnnee]) {
      //       totalPaiementsParMois[moisAnnee] = 0;
      //     }
      
      //     totalPaiementsParMois[moisAnnee] += paiement.incrementValue || 0;
      //   });
      
      //   return totalPaiementsParMois;
      // } 
      async getUserByIdStatestique (idUser: number, role: number): Promise<User|null|any> {
        console.log('roleidUser', idUser)
        console.log('role', role)
        if (typeof idUser !== 'number') {
            throw new Error(`${idUser}`+'Invalid idUser type. Expected number, received ...........' + typeof idUser);
        }
        
        if (role === 1) {
          let totals = {
            'Active driving school': 0,
            'Inactive driving school': 0,
            'All driving school': 0,
            'All Services': 0
          };
          const currentDate = new Date();
    
          // Nombre d'auto-écoles dont la date de création est inférieure à la date d'aujourd'hui
          const countAutoEcolesBeforeToday = await this.prismaservice.autoecole.count({
            where: {
              date_creation: {
                lt: currentDate.toISOString() // Date de création inférieure à la date d'aujourd'hui
              }
            }
          });
    
          // Nombre d'auto-écoles dont la date de création est supérieure à la date d'aujourd'hui
          const countAutoEcolesAfterToday = await this.prismaservice.autoecole.count({
            where: {
              date_creation: {
                gt: currentDate.toISOString() // Date de création supérieure à la date d'aujourd'hui
              }
            }
          });
    
          // Somme totale de toutes les auto-écoles
          const totalAutoEcoles = await this.prismaservice.autoecole.count();
    
          // Compte le nombre de services dans la table service
          const countServices = await this.prismaservice.tarification.count();
          totals['Active driving school'] = countAutoEcolesAfterToday;
          totals['Inactive driving school'] = countAutoEcolesBeforeToday;
          totals['All driving school'] = totalAutoEcoles;
          totals['All Services'] = countServices;
          return  totals
          
        }  
   else if (role === 2) {
      const ecole = await this.prismaservice.autoecole.findFirst({
        where: {
          idUser: idUser
        },
        select: {
          id: true
        }
      });

      if (!ecole) {
        throw new NotFoundException(`Auto-école with user ID ${idUser} not found`);
      }

      const users = await this.prismaservice.user.findMany({
        where: {
          idRole: 3, // Filtrer les utilisateurs avec le rôle 3 (condidat)
          condidat: {
         
              autoecole: {
                id: ecole.id
              
            }
          }
        },
        select: {
          nombre_fois_code: true,
          nombre_fois_conduit: true,
          condidat:true
        }
      });

      let total = {
      'number of driving hours': 0,
      'number of code hours': 0,
      'Code Count': 0,
      'Drive Count': 0
      };

      users.forEach(user => {
        if (user.condidat.nombre_heur_code) {
          total['number of code hours'] += user.condidat.nombre_heur_code;
        }
        if (user.condidat.nombre_heur_conduit) {
          total['number of driving hours'] += user.condidat.nombre_heur_conduit;
        }
        if (user.nombre_fois_code) {
          total['Code Count'] += user.nombre_fois_code;
        }
        if (user.nombre_fois_conduit) {
          total['Drive Count'] += user.nombre_fois_conduit;
        }
      });

      return total; // Retourner l'objet `total`
    } 
   else if(role=== 3){ 
    let totalDifferences = {
      nombre_fois_code: 0,
      driveCount: 0,
      nombre_heur_code: 0,
      nombre_heur_conduit: 0
    };
     const condida= this.prismaservice.user.findUnique({
      where: {
        idUser: idUser,
      },include: {
        condidat:true 
      }
    });
    const u= this.prismaservice.condidat.findUnique({
      where: {
        idCondidat: idUser,
      }
    });
    const nombre_fois_code=(await condida).nombre_fois_code;
    const nombre_fois_conduit= (await condida).nombre_fois_conduit;
    const nombre_heur_code= (await u).nombre_heur_code;
    const nombre_heur_conduit= (await u).nombre_heur_conduit;
    return  {
      'Code Count': nombre_fois_code,
      'Drive Count': nombre_fois_conduit,
      'number of code hours': nombre_heur_code,
      'number of driving hours': nombre_heur_conduit||0
    };
  } 
  else if (role === 4) {
    const moniteurs = await this.prismaservice.moniteur.findMany({
      where: {
        idMoniteur: idUser // Supposons que `idUser` est l'ID de l'auto-école pour le rôle 4
      },
      include: {
        calendrier: {
          select: {
            date_debut: true,
            date_fin: true,
            type: true
          }
        }
      }
    });

    let totalDifferences = {
      'number of driving hours': 0,
      'number of code hours': 0,
      'Code Count': 0,
      'Drive Count': 0
    };

    moniteurs.forEach(moniteur => {
      moniteur.calendrier.forEach(event => {
        const startDate = new Date(event.date_debut);
        const endDate = new Date(event.date_fin);
        const differenceInHours = (endDate.getTime() - startDate.getTime()) / (1000 * 3600); // Difference en heures

        switch (event.type) {
          case 'Hour code':
            totalDifferences['number of code hours']  += differenceInHours;
          
            console.log(' totalDifferences.totalHeuresCode', totalDifferences['number of code hours'] )
            break;
          case 'Hour conduit':
            totalDifferences['number of code hours'] += differenceInHours;
         
            case 'Code exam':
              totalDifferences['Code Count'] += 1;
            
              break;
            case 'Conduit exam':
            
              totalDifferences['Drive Count'] += 1;
            break;
          default:
            break;
        }
      });
    });

    return totalDifferences; // Retourner l'objet `totalDifferences`
  } 
} 




async getCondidatById(id: number, role: number): Promise<any> {
  try {
    if (role === 1) {
      return await this.getStatsType1();
    } else if (role === 2) {
      return await this.getStatsType2(id);
    } else if (role === 3) {
      return await this.getStatsType3(id);
    } else if (role === 4) {
      throw new BadRequestException('Aucune donnée disponible');
    } else {
      throw new BadRequestException('Rôle invalide');
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

private async getStatsType1(): Promise<any> {
  const autoecoles = await this.prismaservice.autoecole.findMany({
    select: {
      demande: {
        select: {
          forfait: {
            select: {
              prix: true,
            },
          },
          date_creation: true,
        },
      },
    },
  });

  // Initialize an object to store the total prices by month
  const totalsByMonth: { [key: string]: Decimal } = {};

  // Get the current year
  const currentYear = new Date().getFullYear();

  // Iterate through each autoecole's demands
  autoecoles.forEach((autoecole) => {
    autoecole.demande.forEach((demande) => {
      const date = new Date(demande.date_creation);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' }); // Get month name

      // Only calculate for the current year
      if (year === currentYear) {
        const monthKey = `${month} ${currentYear}`;
        const forfaitPrice = new Decimal(demande.forfait.prix);

        if (totalsByMonth[monthKey]) {
          totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(forfaitPrice);
        } else {
          totalsByMonth[monthKey] = forfaitPrice;
        }
      }
    });
  });

  // Convert totalsByMonth to a simpler object with number values
  const totalsByMonthNumber: { [key: string]: number } = {};
  for (const month in totalsByMonth) {
    totalsByMonthNumber[month] = totalsByMonth[month].toNumber();
  }

  return totalsByMonthNumber;
}


private async getStatsType2(id: number): Promise<any> {
  const ecole = await this.prismaservice.autoecole.findFirst({
    where: {
      idUser: id,
    },
    select: {
      id: true,
    },
  });

  if (!ecole) {
    throw new NotFoundException(`Auto-école avec l'ID utilisateur ${id} non trouvée`);
  }

  const condidats = await this.prismaservice.condidat.findMany({
    where: {
      idAutoecole: ecole.id,
    },
    // include: {
    //   paiement_condidatTopaiement_idCondidat: true, // Inclure la relation paiement
    // },
  });

  if (!condidats || condidats.length === 0) {
    throw new NotFoundException(`Aucun condidat trouvé pour l'auto-école avec ID ${ecole.id}`);
  }

  // Initialiser l'objet des paiements totaux
  const totalPaiementsParMois: Record<string, number> = {};

  // Itérer sur chaque condidat et calculer les paiements totaux
  condidats.forEach((condidat) => {
    const paiements = 0;
    // condidat.paiement_condidatTopaiement_idCondidat;
    // paiements.forEach((paiement) => {
    //   const dateCreation = new Date(paiement.date_creation);
    //   const moisAnnee = `${dateCreation.getMonth() + 1}-${dateCreation.getFullYear()}`;

    //   if (!totalPaiementsParMois[moisAnnee]) {
    //     totalPaiementsParMois[moisAnnee] = 0;
    //   }

    //   totalPaiementsParMois[moisAnnee] += paiement.incrementValue || 0;
    // });
  });

  return {
    autoecole: ecole,
    totalPaiementsParMois,
    condidats,
  };
}

private async getStatsType3(id: number): Promise<any> {
  const condidat = await this.prismaservice.condidat.findUnique({
    where: { idCondidat: id },
    // include: { paiement_condidatTopaiement_idCondidat: true },
  });

  if (!condidat) {
    throw new NotFoundException(`Condidat avec l'ID ${id} non trouvé`);
  }

  // const paiements = condidat.paiement_condidatTopaiement_idCondidat;
  const paiements=0;
  // Calculer les paiements totaux par mois
  // const totalPaiementsParMois = this.calculateTotalPaymentsByMonth(paiements);

  return {
    condidat,
    // totalPaiementsParMois,
  };
}


private calculateTotalPaymentsByMonth(paiements: any[]): Record<string, number> {
  const totalPaiementsParMois: Record<string, number> = {};

  paiements.forEach((paiement) => {
    const dateCreation = new Date(paiement.date_creation);
    const moisAnnee = `${dateCreation.getMonth() + 1}-${dateCreation.getFullYear()}`;

    if (!totalPaiementsParMois[moisAnnee]) {
      totalPaiementsParMois[moisAnnee] = 0;
    }

    totalPaiementsParMois[moisAnnee] += paiement.incrementValue || 0;
  });

  return totalPaiementsParMois;
}
// async total(idUser: number, idRole: number): Promise<ForfaitStatistique[]> {
//   console.log('iii', idUser)
//   const currentYear = new Date().getFullYear();

//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December',
//   ];

//   const totalsByMonth: { [key: string]: Decimal } = {};
//   months.forEach(month => {
//     totalsByMonth[`${month} ${currentYear}`] = new Decimal(0);
//   });

 
//   if (idRole === 1) {
//     // Fetch 'demandes' from the database with specific conditions
//     const demandes = await this.prismaservice.demande.findMany({
//       where: {
//         AND: [
//           {
//             OR: [
//               { type: 'demande_achat' },
//               { type: 'demande_achat_custom_forfait' },
//             ],
//           },
//           { statut: 'acceptée' }
//         ],
//       },
//       select: {
//         date_creation: true,
//         forfait: {
//           select: {
//             prix: true,
//           },
//         },
//       },
//     });
 
//     // Initialize totalsByMonth if it isn't already initialized
//     const totalsByMonth = [];
  
//     // Iterate over each 'demande' to process its data
//     demandes.forEach(demande => {
//       // Parse the date_creation to extract year and month
//       const date = new Date(demande.date_creation);
//       const year = date.getFullYear();
//       // const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Pad month to two digits
//       const month = date.toLocaleString('default', { month: 'long' });
//       // Check if the year of the demande is the current year
//       if (year === currentYear) {
//         const monthKey = `${month}`;
//         const forfaitPrice = new Decimal(demande.forfait.prix);
  
//         // Initialize the month's total if it doesn't exist
//         if (!totalsByMonth[monthKey]) {
//           totalsByMonth[monthKey] = new Decimal(0);
//         }
  
//         // Sum the price of the forfait for the respective month
//         totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(forfaitPrice);
//       }
//     });
  
//     // The result is an object with the total prices for each month of the current year
//     // return totalsByMonth;
//   }
  
  
  
//   else if (idRole === 2) {
//     const autoecole = await this.prismaservice.autoecole.findFirst({
//       where: { idUser: idUser },
//     });

//     if (!autoecole) {
//       console.log(`Autoecole not found for idUser: ${idUser}`);
//       return [];
//     }

//     const condidats = await this.prismaservice.condidat.findMany({
//       where: { idAutoecole: autoecole.id },
//     });

//     const condidatIds = condidats.map(condidat => condidat.idCondidat);
//     const contrats = await this.prismaservice.contrat.findMany({
//       where: { idCondidat: { in: condidatIds } },
//     });

//     const contratIds = contrats.map(contrat => contrat.idContrat);
//     const paiements = await this.prismaservice.paiement.findMany({
//       where: { idContrat: { in: contratIds } },
//       select: { date_creation: true, incrementValue: true },
//     });

//     paiements.forEach(paiement => {
//       const date = new Date(paiement.date_creation);
//       const year = date.getFullYear();
//       const month = date.toLocaleString('default', { month: 'long' });

//       if (year === currentYear) {
//         const monthKey = `${month} ${currentYear}`;
//         const incrementValue = new Decimal(paiement.incrementValue);
//         totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(incrementValue);
//       }
//     });

//   } else if (idRole === 3) {
//     const condidat = await this.prismaservice.condidat.findFirst({
//       where: { idCondidat: idUser },
//     });

//     if (!condidat) {
//       console.log(`Condidat not found for idUser: ${idUser}`);
//       return [];
//     }

//     const contrat = await this.prismaservice.contrat.findFirst({
//       where: { idCondidat: condidat.idCondidat },
//       orderBy: { date_creation: 'desc' },
//     });

//     if (!contrat) {
//       console.log(`Contrat not found for Condidat: ${condidat.idCondidat}`);
//       return [];
//     }

//     const paiements = await this.prismaservice.paiement.findMany({
//       where: { idContrat: contrat.idContrat },
//       select: { date_creation: true, incrementValue: true },
//     });

//     paiements.forEach(paiement => {
//       const date = new Date(paiement.date_creation);
//       const year = date.getFullYear();
//       const month = date.toLocaleString('default', { month: 'long' });

//       if (year === currentYear) {
//         const monthKey = `${month} ${currentYear}`;
//         const incrementValue = new Decimal(paiement.incrementValue);
//         totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(incrementValue);
//       }
//     });

//   } else {
//     console.log(`Traitement pour un autre rôle: ${idRole}`);
//     return [];
//   }

//   const result: ForfaitStatistique[] = months.map(month => {
//     const monthKey = `${month} ${currentYear}`;
//     return { mois: month, total: totalsByMonth[monthKey].toNumber() };
//   });

//   return result;
// }

async total(idUser: number, idRole: number): Promise<ForfaitStatistique[]> {
  console.log('iii', idUser);
  const currentYear = new Date().getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Initialize totalsByMonth with Decimal(0) for each month of the current year
  const totalsByMonth: { [key: string]: Decimal } = {};
  monthNames.forEach(month => {
    totalsByMonth[month] = new Decimal(0);
  });

  if (idRole === 1) {
    // Fetch 'demandes' from the database with specific conditions
    const demandes = await this.prismaservice.demande.findMany({
      where: {
        AND: [
          {
            OR: [
              { type: 'demande_achat' },
              { type: 'demande_achat_custom_forfait' },
            ],
          },
          { statut: 'acceptée' },
        ],
      },
      select: {
        date_creation: true,
        forfait: {
          select: {
            prix: true,
          },
        },
      },
    });

    // Iterate over each 'demande' to process its data
    demandes.forEach(demande => {
      // Parse the date_creation to extract year and month
      const date = new Date(demande.date_creation);
      const year = date.getFullYear();
      const monthIndex = date.getMonth(); // Month index (0-11)

      // Check if the year of the demande is the current year
      if (year === currentYear) {
        const monthKey = monthNames[monthIndex];
        const forfaitPrice = new Decimal(demande.forfait.prix);

        // Sum the price of the forfait for the respective month
        totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(forfaitPrice);
      }
    });
  }
   else if (idRole === 2) {
    const autoecole = await this.prismaservice.autoecole.findFirst({
      where: { idUser: idUser },
    });

    if (!autoecole) {
      console.log(`Autoecole not found for idUser: ${idUser}`);
      return [];
    }

    const condidats = await this.prismaservice.condidat.findMany({
      where: { idAutoecole: autoecole.id },
    });

    const condidatIds = condidats.map(condidat => condidat.idCondidat);
    const contrats = await this.prismaservice.contrat.findMany({
      where: { idCondidat: { in: condidatIds } },
    });
console.log('contrats', contrats)
    const contratIds = contrats.map(contrat => contrat.idContrat);
    const paiements = await this.prismaservice.paiement.findMany({
      where: { idContrat: { in: contratIds } },
      select: { date_creation: true, incrementValue: true },
    });
    console.log('paiements', paiements)
    paiements.forEach(paiement => {
      const date = new Date(paiement.date_creation);
      const year = date.getFullYear();
      const monthIndex = date.getMonth(); // Month index (0-11)

      if (year === currentYear) {
        const monthKey = monthNames[monthIndex];
        const incrementValue = new Decimal(paiement.incrementValue);
        console.log(`Month: ${monthKey}, Increment: ${incrementValue}`); // Debugging line

        totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(incrementValue);
      }
    });
  }
  else if (idRole === 3) {
    const condidat = await this.prismaservice.condidat.findFirst({
      where: { idCondidat: idUser },
    });

    if (!condidat) {
      console.log(`Condidat not found for idUser: ${idUser}`);
      return [];
    }

    const contrat = await this.prismaservice.contrat.findFirst({
      where: { idCondidat: condidat.idCondidat },
      orderBy: { date_creation: 'desc' },
    });

    if (!contrat) {
      console.log(`Contrat not found for Condidat: ${condidat.idCondidat}`);
      return [];
    }
console.log('contrat', contrat)
    const paiements = await this.prismaservice.paiement.findMany({
      where: { idContrat: contrat.idContrat },
      select: { date_creation: true, incrementValue: true },
    });
    console.log('paiements', paiements)
    paiements.forEach(paiement => {
      const date = new Date(paiement.date_creation);
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      if (year === currentYear) {
        const monthKey = monthNames[monthIndex];
        const incrementValue = new Decimal(paiement.incrementValue);
        console.log(`Month: ${monthKey}, Increment: ${incrementValue}`); // Debugging line

        totalsByMonth[monthKey] = totalsByMonth[monthKey].plus(incrementValue);
      }
    });

  }
  else {
        console.log(`Traitement pour un autre rôle: ${idRole}`);
        return [];
      }
  // Convert totalsByMonth to an array of ForfaitStatistique objects
  const statistics: ForfaitStatistique[] = Object.keys(totalsByMonth).map(monthKey => {
    return {
      mois: monthKey,
      total: totalsByMonth[monthKey].toNumber(),
    };
  });

  // Return the statistics array
  return statistics;
}





// async getPaiementDernierContrat(idUser) {
//   try {
//     // Fetch the latest contract details for the candidate
//     const dernierContrat = await this.prismaservice.condidat.findFirst({
//       where: { idCondidat: idUser },
//       select: {
//         user: {
//           select: {
//             nom: true,
//             prenom: true,
//             cin: true,
//           },
//         },
//         autoecole: {
//           select: {
//             nom: true,
//             adresse: true,
//             telephone: true,
//             email: true,
//           },
//         },
//         contrats: {
//           orderBy: {
//             date_creation: 'desc',
//           },
//           take: 1,
//           select: {
//             idContrat: true,
//             paiement: {
//               select: {
//                 incrementType: true,
//                 incrementValue: true,
//                 date_creation: true,
//               },
//             },
//           },
//         },
//       },
//     });
// console.log('dernierContrat', dernierContrat)
//     // Validate if a contract was found and retrieve its ID
//     const idDernierContrat = dernierContrat?.contrats[0]?.idContrat;
//     if (!idDernierContrat) {
//       throw new Error('No contract found for this candidate');
//     }

//     const paiements = dernierContrat.contrats[0].paiement;
// console.log('paiements', paiements)
//     // Create a PDF with the list of payments
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([600, 400]);
//     const { width, height } = page.getSize();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     // Left-aligned user information
//     const userText = `User: Nom: ${dernierContrat.user.nom} Prenom: ${dernierContrat.user.prenom} CIN: ${dernierContrat.user.cin}`;
//     page.drawText(userText, {
//       x: 50,
//       y: height - 50,
//       size: 12,
//       font: font,
//     });

//     // Right-aligned driving school information
//     const autoecoleText = `Autoécole: Nom: ${dernierContrat.autoecole.nom} Adresse: ${dernierContrat.autoecole.adresse} Tel: ${dernierContrat.autoecole.telephone} Email: ${dernierContrat.autoecole.email}`;
//     const autoecoleTextWidth = font.widthOfTextAtSize(autoecoleText, 12);
//     page.drawText(autoecoleText, {
//       x: width - autoecoleTextWidth - 50,
//       y: height - 50,
//       size: 12,
//       font: font,
//     });

//     // Add column headers for the payments table
//     const headers = ['Increment Type', 'Increment Value', 'Date Creation'];
//     let yOffset = height - 100;
//     headers.forEach((header, index) => {
//       page.drawText(header, {
//         x: 50 + index * 150,
//         y: yOffset,
//         size: 12,
//         font: font,
//         color: rgb(0, 0, 0),
//       });
//     });

//     // Add payments
//     yOffset -= 20;
//     paiements.forEach((paiement) => {
//       page.drawText(paiement.incrementType, {
//         x: 50,
//         y: yOffset,
//         size: 12,
//         font: font,
//       });
//       page.drawText(paiement.incrementValue.toString(), {
//         x: 200,
//         y: yOffset,
//         size: 12,
//         font: font,
//       });
//       page.drawText(paiement.date_creation.toISOString(), {
//         x: 350,
//         y: yOffset,
//         size: 12,
//         font: font,
//       });
//       yOffset -= 20;
//     });

//     const pdfBytes = await pdfDoc.save();

//     // Save the PDF file
//     fs.writeFileSync('liste_paiements.pdf', pdfBytes);
//     return pdfBytes;
//   } catch (error) {
//     this.logger.error(`Error generating PDF: ${error.message}`);
//     throw error;
//   }
// }

async getPaiementDernierContrat(idUser: number): Promise<Uint8Array> {
  try {
    // Fetch the latest contract details for the candidate
    const dernierContrat = await this.prismaservice.condidat.findFirst({
      where: { idCondidat: idUser },
      select: {
        user: {
          select: {
            nom: true,
            prenom: true,
            cin: true,
          },
        },
        autoecole: {
          select: {
            nom: true,
            adresse: true,
            telephone: true,
            email: true,
          },
        },
        contrats: {
          orderBy: {
            date_creation: 'desc',
          },
          take: 1,
          select: {
            idPermi:true,
            idContrat: true,
            paiement: {
              select: {
                incrementType: true,
                incrementValue: true,
                date_creation: true,
              },
            },
          },
        },
      },
    });
const permi=await this.prismaservice.permi.findUnique({
  where:{idPermi:dernierContrat.contrats[0].idPermi},
  select:{type:true}
})
const p=permi.type
    // Validate if a contract was found and retrieve its ID
    if (!dernierContrat || !dernierContrat.contrats.length) {
      throw new Error('No contract found for this candidate');
    }

    const paiements = dernierContrat.contrats[0].paiement;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Define autoecole information
    const autoecoleNom = `Nom: ${dernierContrat.autoecole.nom}`;
    const autoecoleAdresse = `Adresse: ${dernierContrat.autoecole.adresse}`;
    const autoecoleTel = `Tel: ${dernierContrat.autoecole.telephone}`;
    const autoecoleEmail = `Email: ${dernierContrat.autoecole.email}`;

    // Draw autoecole information
    let yOffset = height - 50; // Starting y position
    page.drawText(autoecoleNom, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 20;
    page.drawText(autoecoleAdresse, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 20;
    page.drawText(autoecoleTel, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 20;
    page.drawText(autoecoleEmail, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 30; // Adjust space between sections

    // Define user information
    const userNom = `Nom: ${dernierContrat.user.nom}`;
    const userPrenom = `Prénom: ${dernierContrat.user.prenom}`;
    const userCIN = `CIN: ${dernierContrat.user.cin}`;
    const permis = `Permi: ${p}`;
    // Draw user information
    page.drawText(userNom, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 20;
    page.drawText(userPrenom, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 20;
    page.drawText(userCIN, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 20;
    page.drawText(permis, {
      x: 50,
      y: yOffset,
      size: 12,
      font: font,
    });
    yOffset -= 30; // Adjust space between sections

    // Add column headers for the payments table
    const headers = ['Increment Type', 'Increment Value', 'Date Creation'];
    const columnWidth = 150;
    const tableTopY = yOffset; // Top position of the table
    const tableLeftX = 50; // Left position of the table
    const cellPadding = 5; // Padding inside the cells
    const rowHeight = 20; // Height of each row
    const borderWidth = 1; // Border width

    // Function to draw a cell with border and text
    const drawCell = (x: number, y: number, text: string) => {
      // Draw the text inside the cell with padding
      page.drawText(text, {
        x: x + cellPadding,
        y: y - rowHeight + cellPadding,
        size: 12,
        font: font,
      });
      // Draw the border of the cell
      page.drawLine({
        start: { x, y },
        end: { x: x + columnWidth, y },
        thickness: borderWidth,
        color: rgb(0, 0, 0),
      });
      page.drawLine({
        start: { x: x + columnWidth, y },
        end: { x: x + columnWidth, y: y - rowHeight },
        thickness: borderWidth,
        color: rgb(0, 0, 0),
      });
      page.drawLine({
        start: { x, y: y - rowHeight },
        end: { x: x + columnWidth, y: y - rowHeight },
        thickness: borderWidth,
        color: rgb(0, 0, 0),
      });
      page.drawLine({
        start: { x, y },
        end: { x, y: y - rowHeight },
        thickness: borderWidth,
        color: rgb(0, 0, 0),
      });
    };

    // Draw headers with borders
    headers.forEach((header, index) => {
      drawCell(tableLeftX + index * columnWidth, tableTopY, header);
    });

    // Draw payments data with borders
    paiements.forEach((paiement, rowIndex) => {
      const rowY = tableTopY - (rowIndex + 1) * rowHeight;
      drawCell(tableLeftX, rowY, paiement.incrementType);
      drawCell(tableLeftX + columnWidth, rowY, paiement.incrementValue.toString());
      drawCell(tableLeftX + 2 * columnWidth, rowY, paiement.date_creation.toISOString());
    });

    const pdfBytes = await pdfDoc.save();

    // Save the PDF file
    fs.writeFileSync('liste_paiements.pdf', pdfBytes);
    return pdfBytes;
  } catch (error) {
    this.logger.error(`Error generating PDF: ${error.message}`);
    throw error;
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
}

