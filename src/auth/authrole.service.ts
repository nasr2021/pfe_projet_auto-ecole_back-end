import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleService {

  constructor(private readonly prisma: PrismaService) {} // Injectez le service Prisma

//   async getRoleNameById(roleId: number): Promise<string | undefined> {
//     const role = await this.prisma.roles.findUnique({ where: { idRole: roleId } });
//     return role ? role.nom_role : undefined;
//   }
}
