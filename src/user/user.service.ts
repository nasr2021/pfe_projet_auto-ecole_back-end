import { PrismaService } from "src/prisma/prisma.service";
import { User } from "./user.model";
import { role } from "./role.model";
import { Injectable } from "@nestjs/common";
@Injectable()
export class UserService{
    constructor(private prismaservice:PrismaService){}
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
                numero_compte: idCompteConnecte.toString()
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

async createUser(data: any, idCompteConnecte: number): Promise<User> {
    const roleId = await this.getRoleIdByRoleName(data.job);
    if (!roleId) {
        throw new Error(`Le rôle "${data.job}" n'existe pas.`);
    }
    

    const connectedUser = await this.prismaservice.user.findUnique({
        where: { idUser: idCompteConnecte }
    });
    if (!connectedUser || !connectedUser.idAutoEcole) {
        throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
    }

    const idAutoEcole = connectedUser.idAutoEcole;
    const autoEcole = await this.prismaservice.autoecole.findUnique({
        where: { id: idAutoEcole }
      });
      if (!autoEcole || !autoEcole.nom) {
        throw new Error(`Impossible de récupérer le nom de l'auto-école.`);
      }

const randomPart = this.generateRandomString(4);

const username = `${autoEcole.nom}.${randomPart}`;
console.log('Username:', username);
const password= this.generateRandomPassword(8);
console.log('password:', password);
    
    const userData = { ...data, idRole: roleId, account: true, idCompteConnecte: idCompteConnecte, idAutoEcole: idAutoEcole,password: password,username:username }; 

    return this.prismaservice.user.create({
        data: userData,
    });
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
  async getAllUsersByAutoEcoleId(userId: number): Promise<User[]> {
    
    const connectedUser = await this.prismaservice.user.findUnique({
        where: { idUser: userId }
    });
    if (!connectedUser || !connectedUser.idAutoEcole) {
        throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
    }

    
    const idAutoEcole = connectedUser.idAutoEcole;
    const roleEcole = await this.prismaservice.roles.findFirst({
        where: { nom_role: "ecole" }
    });
    if (!roleEcole) {
        throw new Error(`Impossible de récupérer l'ID du rôle "école".`);
    }
    
    const users = await this.prismaservice.user.findMany({
        where: { idAutoEcole ,
            NOT: { idRole: roleEcole.idRole } 
        }
    });

    return users;
}

async getAllUsersByAutoEcoleIdAndRole(role: string, userId: number): Promise<User[]> {
    
    const connectedUser = await this.prismaservice.user.findUnique({
        where: { idUser: userId }
    });
    if (!connectedUser || !connectedUser.idAutoEcole) {
        throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
    }

    
    const idAutoEcole = connectedUser.idAutoEcole;

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

    async getUserByAccount(account: boolean, idCompteConnecte: number): Promise<User[] | null> {
        return this.prismaservice.user.findMany({
            where: {
                numero_compte: idCompteConnecte.toString(),
                account: account,
            },
            select: {
                idUser: true,
                nom: true,
                prenom: true,
                numero_telephone1: true,
                numero_telephone2: true,
                account: true,
                idRole: true
            },
        });
    }
     
      
    
    async updateUser(idUser:number,data:User):Promise<User>{
        return this.prismaservice.user.update({
            where:{idUser:Number(idUser)},
            data:{nom:data.nom,prenom:data.prenom,email:data.email,numero_telephone1:data.numero_telephone1,nom_entreprise:data.nom_entreprise,
                matricule:data.matricule,description:data.description,horaire_ouverture:data.horaire_ouverture,
                horaire_fermeture:data.horaire_fermeture,qualification:data.qualification,
                experience:data.experience,langage:data.langage,adresse:data.adresse,voitures_existantes:data.voitures_existantes,date_naissance:data.date_naissance,
                cin:data.cin,account:data.account, gender:data.gender,job:data.job,numero_permis:data.numero_permis,
                date_prise_permis:data.date_prise_permis,type_permis_pris:data.type_permis_pris,type_permis_souhaite:data.type_permis_souhaite,
            }
        })
    }
    async deleteUser(idUser:number):Promise<User>{
        return this.prismaservice.user.delete({
            where:{idUser:Number(idUser)}
        })
    }
}