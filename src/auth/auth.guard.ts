import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}
 
  async getRoleNameById(roleId: number): Promise<string | undefined> {
    const role = await this.prisma.roles.findUnique({ where: { idRole: roleId } });
    return role ? role.nom_role : undefined;
  }
 
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const UserId = request.user.sub;
    const userIdRole = request.user.idRole;
    console.log('userIdRole:', userIdRole);

    const userRole = await this.getRoleNameById(userIdRole); 
    console.log('userIdRole:', userIdRole);
    console.log('UserId:', UserId);

    if (!userRole) {
      throw new UnauthorizedException('Rôle de l\'utilisateur non trouvé');
    }

    const isAuthorized = requiredRoles.includes(userRole);
    console.log('IsAuthorized:', isAuthorized);
    return isAuthorized;
  }
}




