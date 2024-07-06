import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto, UpdatePasswordWithOTPDto } from './dto';
import * as bcrypt from 'bcrypt'
import { Tokens } from './types';
import * as cron from 'node-cron';
import * as admin from 'firebase-admin';
import { User } from 'src/user/user.model';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}
  async getRoleIdByRoleName(roleName: string): Promise<number | null> {
    const role = await this.prismaService.roles.findFirst({
      where: { nom_role: roleName },
      select: { idRole: true },
    });
    return role ? role.idRole : null;
  }
  async getRoleNameByRoleId(roleId: number): Promise<string | null> {
    const role = await this.prismaService.roles.findFirst({
      where: { idRole: roleId },
      select: { nom_role: true },
    });
    return role ? role.nom_role : null;
  }
  
  async signup(dto: AuthDto): Promise<Tokens> {
    try {
      const hash = await bcrypt.hash(dto.password, 10);
      
      const hashRt = await this.hashData(dto.password);
  
      const idRole = await this.getRoleIdByRoleName(dto.role);
  
      const newUser = await this.prismaService.user.create({
        data: {
          idRole: idRole,
          username: dto.username,
          password: dto.password, 
       
          hash: hash,
          hashedRt: hashRt, 
        },
      });
  
      const tokens = await this.getToken(newUser.idUser, newUser.username, idRole);
    //  await this.updateRtHash(newUser.idUser, tokens.refresh_token);
  
      return tokens;
    } catch (error) {
      console.error('Failed to create account:', error);
      throw new UnauthorizedException('Failed to create account');
    }
  }
  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
   console.log('hashedPassword', hashedPassword)
   console.log('plainPassword', plainPassword)
    return plainPassword === hashedPassword;
  }
  

  async login(dto: AuthDto): Promise<{ tokens: Tokens, role: string, usersConnect: number, avatar:string  }> {
    console.log('Attempting login with username:', dto.username);
    const user = await this.prismaService.user.findFirst({
      where: {
        username: dto.username,
      }
    });

    if (!user) {
      console.log('User not found:', dto.username);
      throw new ForbiddenException('Nom d\'utilisateur ou mot de passe invalide');
    }

    const cleanedPlainPassword = dto.password.trim();
    const cleanedHashedPassword = user.password.trim();

    console.log('Plain Password:', cleanedPlainPassword);
    console.log('Hashed Password in Database:', cleanedHashedPassword);
    const passwordMatches = await this.comparePasswords(cleanedPlainPassword, cleanedHashedPassword);
    console.log('Password Matches:', passwordMatches);
    if (!passwordMatches) {
      console.log('Login failed for username:', dto.username);
      throw new ForbiddenException('Nom d\'utilisateur ou mot de passe invalide');
    }
 
    console.log('Login successful for username:', dto.username);
   
    // Vérification de la date de création par rapport à aujourd'hui + 1 jour
   
    const idRole = user.idRole;
    const role = await this.prismaService.roles.findUnique({
      where: {
        idRole: user.idRole, 
      },
      select: {
        nom_role: true, 
      },
    })
    const updatedUser = await this.prismaService.user.update({
      where: {
          idUser: user.idUser,
      },
      data: {
        connecte: user.connecte + 1,
      },
    });
    
  
    const tokens = await this.getToken(user.idUser, user.username, idRole);
   
  if(idRole===2){
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 1); // Ajoute 1 jour

    if (user.date_creation < new Date()) {
      console.log('new Date()', new Date())
      console.log('user.date_creation', user.date_creation)
      console.log('Session expired for user:', dto.username);
      throw new ForbiddenException('Session expirée. Veuillez payer pour renouveler votre session.');
    }
    // Planification de la notification cron 24 heures avant l'expiration de la session
    const notificationTime = new Date(user.date_creation.getTime() - (24 * 60 * 60 * 1000));
    const cronExpression = `${notificationTime.getMinutes()} ${notificationTime.getHours()} ${notificationTime.getDate()} ${notificationTime.getMonth() + 1} *`;

    cron.schedule(cronExpression, async () => {
      try {
        // Enregistrement de la notification dans la base de données
        await this.prismaService.notification.create({
          data: {
            lu: false,
            idUser: user.idUser,
            description: `Your session will expire in 24 hours.`,
            date_creation: this.formatDate(new Date()),
          },
        });

        // Envoi de la notification Firebase
        if (user.firebaseToken) {
          const message = {
            notification: {
              title: 'Expiration de session',
              body: 'Your session will expire in 24 hours.',
            },
            token: user.firebaseToken,
          };

          const response = await admin.messaging().send(message);
          console.log('Notification envoyée avec succès:', response);
        } else {
          console.log('Aucun token Firebase disponible.');
        }
      } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
      }
    });
  }
    return { tokens, role: role.nom_role, avatar: user.avatar,  usersConnect: updatedUser.connecte}; 
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
async logout(idUser: number): Promise<number> {
  await this.prismaService.user.updateMany({
    where: {
      idUser: idUser,
      hashedRt: {
        not: null,
      },
    },
    data: {
      hashedRt: null,
    },
  });
  return idUser;
}
async refreshToken(userId: number, refreshToken: string): Promise<Tokens> {
  try {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: 'rt-secret',
    });
    if (payload.sub !== userId) {
      throw new UnauthorizedException('Invalid user ID');
    }
    const accessToken = await this.jwtService.signAsync({ sub: userId }, {
      secret: 'at-secret',
      expiresIn: '15m', 
    });
    return { access_token: accessToken, refresh_token: refreshToken };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw new UnauthorizedException('Invalid refresh token');
  }
}
async hashData(data: string): Promise<string> {
  return bcrypt.hash(data, 10);
}

async getToken(idUser: number, username: string, roleId: number): Promise<Tokens> {
  const [at, rt] = await Promise.all([
    this.jwtService.signAsync(
      {
        sub: idUser,
        username,
        idRole: roleId, 
        
      },
      {
        secret: 'at-secret',
        expiresIn: 60 * 60 * 24 * 365,
      },
    ),
    this.jwtService.signAsync(
      {
        sub: idUser,
        username,
        idRole: roleId,
      },
      {
        secret: 'rt-secret',
        expiresIn: 60 * 60 * 24 * 365,
      },
    ),
  ]);

  return {
    access_token: at,
    refresh_token: rt,
  };
}
async updateRtHash(idUser: number, rt: string): Promise<void> {
  const hash = await this.hashData(rt);
  await this.prismaService.user.update({
    where: {
      idUser: idUser,
    },
    data: {
      hashedRt: hash,
    },
  });
}
async updatePasswordWithOTP(dto: UpdatePasswordWithOTPDto): Promise<void> {
  const { idUser, oldPassword, newPassword, newPasswordConfirm, otp } = dto;
console.log('dto', dto)
  try {
      const user = await this.prismaService.user.findUnique({
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
  await this.prismaService.user.update({
    where: { idUser },
    data: { otp: null },
  });
} catch (error) {
      this.logger.error(`Failed to update password with OTP: ${error.message}`, error.stack);
      throw new Error('Failed to update password with OTP.');
    }
}
async validateOTP(idUser: number, otp: string): Promise<boolean> {
  const user = await this.prismaService.user.findUnique({
    where: { idUser },
  });
  if (!user || !user.otp) {
    return false;
  }
  return user.otp === otp;
}

async updatePassword(idUser: number, hashedPassword: string, newPassword: string): Promise<void> {
  await this.prismaService.user.update({
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
}