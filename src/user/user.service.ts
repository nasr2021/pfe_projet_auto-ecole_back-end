import { PrismaService } from "src/prisma/prisma.service";
import { User } from "./user.model";
import { role } from "./role.model";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Prisma, cars, condidat, moniteur } from "@prisma/client";
import * as path from 'path';
import * as fs from 'fs';
import { Twilio } from 'twilio';
import * as bcrypt from 'bcrypt'
import { UpdatePasswordWithOTPDto } from "src/auth/dto";
@Injectable()
export class UserService{
    private readonly logger = new Logger(UserService.name);
    private twilioClient: Twilio;
    constructor(private prismaservice:PrismaService){ 
        this.twilioClient = new Twilio('ACb75e5dd7011e2263abacf1201a5f7e9e', 'da13b20c0cae5f0eaf50a336bbf81206');
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
      async generateAndSendOTP(idUser: number): Promise<void> {
        try {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const user = await this.prismaservice.user.findUnique({
            where: { idUser },
          });
          const phone = user?.numero_telephone1;
          if (!user || !phone) {
            throw new Error('User not found or phone number not provided.');
          }
          const formattedPhone = `+216${phone}`;
          // Envoi de l'OTP par SMS
          await this.sendsSMS(formattedPhone, otp);
    
          // Enregistrer l'OTP dans la base de données
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
    try {// Valider l'OTP
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

async createUser(data: any, idCompteConnecte: number): Promise<User> {   
        const roles = await this.getRoleIdByRoleName(data.emploi);
        const currentDate = new Date();
        
        const connectedUser = await this.prismaservice.gerantecole.findUnique({
            where: { idGerant: Number(idCompteConnecte )}, 
            select: {
                autoecole: true,
            },
        });
        console.log('Roles:', roles);
        if (!connectedUser || !connectedUser.autoecole[0].id) {
            throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
        }
    
        const idAutoEcole =Number( connectedUser.autoecole[0].id);
        const autoEcole = connectedUser.autoecole[0].nom;
        const candidatautoEcole = connectedUser.autoecole[0].candidats;
    const randomPart = this.generateRandomString(4);
    
    const username = `${autoEcole}.${randomPart}`;
    console.log('Username:', username);
    const password= this.generateRandomPassword(8);
    console.log('password:', password);
        const userData = { ...data, idAutoEcole: idAutoEcole,password: password,username:username, idRole:Number(roles), date_creation:currentDate }; 
        console.log('userData', userData)
      
        console.log('data.emploi', data.emploi)
        if (data.emploi == 'candidat') {
            const createdUser = await this.prismaservice.user.create({
                data: userData,
            
            });
            await this.prismaservice.condidat.create({
                data: {
                    date_creation:currentDate,
                    idCondidat: Number(createdUser.idUser),
                    idAutoecole:Number(idAutoEcole) 
                },
            } );
            const candidatautoEcoles=candidatautoEcole+1
           await this.prismaservice.autoecole.update({
                where: { id: idAutoEcole },
                data: { candidats: candidatautoEcoles },
            });
            // await this.sendSMS(data.numero_telephone1, `Your account has been created. Username: ${username}, Password: ${password}`);
            return  createdUser;
        } else if (data.emploi == 'moniteur') {
           
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
                        date_creation:currentDate,
                        idMoniteur: Number(createdUser.idUser), 
                        idAutoecole: Number(idAutoEcole), 
                    },
                });
                await this.prismaservice.autoecole.update({
                    where: { id: Number(idAutoEcole) },
                    data: { moniteurs: moniteursDisponibles - 1 },
                });
                 // Send SMS with username and password
    await this.sendSMS(data.numero_telephone1, `Your account has been created. Username: ${username}, Password: ${password}`);

                return createdUser;
            } else {
                throw new Error(`Achetez des comptes pour l'auto-école avant de créer un nouveau moniteur.`);
            }
        }
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
   
    async getUserById(idUser: number): Promise<User|null> {
        if (typeof idUser !== 'number') {
            throw new Error('Invalid idUser type. Expected number, received ' + typeof idUser);
        }
        
  return this.prismaservice.user.findUnique({
    where: {
      idUser: idUser,
    },
  });
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
        }
    });

    return users;
}         
async updateUser(idUser:number,data:User):Promise<User>{
        if (!idUser || !data) {
            throw new Error("Les paramètres idUser et data sont nécessaires.");
          }  
        return this.prismaservice.user.update({
            where:{idUser:Number(idUser)},
            data:{
               ...data }
        })
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
            }
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
            
        })
        return candidat;
      }

}



//     private async sendSMS(phoneNumber: string, message: string): Promise<void> {
//         try {
//             console.log('phoneNumber',phoneNumber)
//             console.log('message',message)
//           const response = await axios.post('https://textbelt.com/text', {
//             phone: phoneNumber,
//             message: message,
//             key: '3a8e83b4d3a3e34f395da594f9c867bd8499f3d7VmgZqhSiqqSfZV7PueSdBQa5L'
//         });
//         console.log("(SMS Response:, response.data);", response.data);
//       } 
      
//   catch (error) {
//         console.error('Error sending SMS:', error);
//       }
//     };
   