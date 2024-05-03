import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt'
import { Tokens } from './types';

@Injectable()
export class AuthService {

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
    return plainPassword === hashedPassword;
  }
  
  
  async login(dto: AuthDto): Promise<Tokens> {
    console.log('Attempting login with username:', dto.username);
    const user = await this.prismaService.user.findFirst({
      where: {
        username: dto.username,
      },
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
    const idRole = user.idRole;

    const tokens = await this.getToken(user.idUser, user.username, idRole);
    return tokens;
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
        expiresIn: 60 * 15,
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
        expiresIn: 60 * 60 * 24 * 7,
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
}
