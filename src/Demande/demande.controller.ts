import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { DemandeService, demandeWith } from "./demande.service";
import { Demande } from "./demande.model";
import { AuthGuard } from "@nestjs/passport";
import { demandeWithStats } from './demande.service';
import { AuthMiddleware } from "src/auth/AuthMiddleware";
@Controller('api/demande')

export class DemandeController {
    constructor(private demandeService: DemandeService) {}

    @Get()
    async getAllDemandes(): Promise<Demande[]> {
        return this.demandeService.getAllDemandes();
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
}
    