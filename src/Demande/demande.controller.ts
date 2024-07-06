import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { DemandeService, demandeWith } from "./demande.service";
import { Demande } from "./demande.model";
import { AuthGuard } from "@nestjs/passport";
import { demandeWithStats } from './demande.service';
import { AuthMiddleware } from "src/auth/AuthMiddleware";
import { demande } from "@prisma/client";
@Controller('api/demande')

export class DemandeController {
    constructor(private demandeService: DemandeService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllDemandes(@Req() req: Request & { user: { sub: number, idRole:string}}): Promise<Demande[]> {
      const idCompteConnecte = req.user.sub;
      const idRole = req.user.idRole; 
      return this.demandeService.getAllDemandes( idCompteConnecte , idRole);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get('statistiquesDemande')
  async getStatestique( @Req() req: Request & { user: { sub: number}}): Promise<demandeWithStats[]>{   
    const idCompteConnecte = req.user.sub;
     return this.demandeService.getDemandeStatestique(Number(idCompteConnecte));

  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get('Demandestatistiques')
async getStatestiques(): Promise<demandeWith[]>{   
   return this.demandeService.getStatestique();
}
@Post('password')
async forgetPassword(@Body('username') username: string) {

  console.log('username', username);
  const password = await this.demandeService.forgetPassword(username);
  console.log('password', password);
  return password;
}
}
    