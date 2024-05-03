import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Compte } from "./compte.model";
import * as bcrypt from 'bcrypt'
import { User } from "src/user/user.model";
@Injectable()
export class CompteService{
    constructor(private prismaservice:PrismaService){}
    async getAllCompte():Promise<Compte[]>{
        return await this.prismaservice.compte.findMany()
    }
    async getCompteById(idCompte: number): Promise<Compte|null> {
        return this.prismaservice.compte.findUnique({ where: { idCompte: Number(idCompte) } });
    }
    async getRoleIdByRoleName(roleName: string): Promise<number | null> {
        const role = await this.prismaservice.roles.findFirst({
          where: { nom_role: roleName },
          select: { idRole: true },
        });
        return role ? role.idRole : null;
      }
      async createRandomCompte():Promise<Compte> {
        try {
            const username = this.generateRandomUsername();
    const password = this.generateRandomPassword();

  
    const roleId = await this.getRoleIdByRoleName('candidat');
         const hash = await bcrypt.hash(password, 10);
          
          const hashRt = await this.hashData(password);
          return await this.prismaservice.compte.create({
            data: {
                username,
                password,
                email:'',
                idRole: roleId,
                hash: hash, 
                hashedRt: hashRt, 
            },
        });
        } catch (error) {
            console.error('Failed to create account:', error);
            throw new UnauthorizedException('Failed to create account');
          }
}
async creationWithDataCompte(data: any): Promise<Compte> {
  const hash = await bcrypt.hash(data.password, 10);
  const hashRt = await this.hashData(data.password);
  const roleId = await this.getRoleIdByRoleName('ecole');

  const compteData = {
    ...data,
    username: data.username,
    password: hash,
    hash: hash,
    hashedRt: hashRt,
    idRole: roleId,
  };

  try {
    return await this.prismaservice.compte.create({
      data: {
        email: compteData.email,
        username: compteData.username,
        password: compteData.password,
        hash: compteData.hash,
        hashedRt: compteData.hashedRt,
        idRole: compteData.idRole,
      },
    });
  } catch (error) {
    console.error('Failed to create account:', error);
    throw new InternalServerErrorException('Failed to create account');
  }
}



private generateRandomUsername(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let username = '';
    for (let i = 0; i < length; i++) {
      username += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return username;
  }
  
  private generateRandomPassword(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  }
  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }  
  async deleteOneCompteWithAccountFalse(idUser: number): Promise<Compte> {
    
    console.log("ID de l'utilisateur à supprimer:", idUser); 
    const compteToDelete = await this.prismaservice.compte.findFirst({
        where: {
            account: false,
            idUser: idUser 
        }
    });
  
    if (!compteToDelete) {
        
        throw new Error("Aucun compte avec account === false n'a été trouvé.");
    }
  
  
    return this.prismaservice.compte.delete({
        where: { idCompte: compteToDelete.idCompte }
    });
}






  
  async updateCompte(idCompte: number, data: Compte): Promise<Compte> {
    try {
      if (!data.idUser) {
        throw new BadRequestException('idUser is not provided');
      }
  
      const idUser = await this.getUserIdByIdUser(data.idUser,idCompte);
      console.log('idUser:', idUser); 
  
      if (typeof idUser !== 'number') {
        throw new Error('Invalid idUser type');
      }
  
      const user = await this.prismaservice.user.findUnique({
        where: { idUser: idUser },
        select: { nom: true, prenom: true, numero_telephone1: true, numero_telephone2: true, account: true }
      });
  
      console.log('user:', user); 
  
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      return await this.prismaservice.compte.update({
        where: { idCompte: Number(idCompte) },
        data: {
          username: data.username,
          password: data.password,
          email: data.email,
          idUser: idUser,
          nom: user.nom,
          prenom: user.prenom,
          number1: user.numero_telephone1,
          number2: user.numero_telephone2,
          account: user.account
        },
      });
    } catch (error) {
      console.error('Failed to update account:', error);
      throw new InternalServerErrorException('Failed to update account');
    }
  }
  
  async getUserIdByIdUser(useridCOMPTE: number, COMPTEid: number): Promise<number> {
    const cin = await this.prismaservice.user.findFirst({
      where: {
        idUser: Number(useridCOMPTE),
      },
      select: {
        idUser: true
      }
    });
  
    if (cin) {
      await this.prismaservice.user.update({
        where: {
          idUser: Number(useridCOMPTE),
        },
        data: {
          idCompte: Number(COMPTEid),
        }
      });
  
      return cin.idUser;
    }
  
    throw new NotFoundException('User not found');
  }
  
}