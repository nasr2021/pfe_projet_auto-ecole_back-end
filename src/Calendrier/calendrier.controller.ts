import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CompteService } from "src/Compte/compte.service";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { RolesGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { CalendrierService, evenementWithStats } from "./calendrier.service";
import { Calendrier } from "./calendrier.model";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { CalendrierDto } from "./dto";

@Controller('api/calendrier')

export class CalendrierController {
      
    constructor(private calendrierService: CalendrierService) {}

    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt')) 
    @Get('statistiquesEvent')
    async getEvenementStatistiques(@Req() req: Request & { user: { sub: number, idRole:string } }): Promise<evenementWithStats[]> {
      const idUser = req.user.sub;
  const userole = req.user.idRole
      try {
        const statistiques = await this.calendrierService.getEvenementStatistiques(idUser,userole);
        return statistiques;
      } catch (error) {
        throw new Error(`Erreur lors de la récupération des statistiques des événements : ${error.message}`);
      }
    }
    
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
 
    @Delete(':idEvenement')
    async deleteCalendrier(@Param('idEvenement') idEvenement:number):Promise<Calendrier>{
        console.log("ID de evenement à supprimer:", idEvenement); 
        return this.calendrierService.deleteCalendrier(idEvenement);

    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Put(':idEvenement')
    async updateCalendrier(@Param('idEvenement') idEvenement:number,@Body() data: Partial<CalendrierDto>,):Promise<Calendrier>{
        const calendrierToUpdate: Calendrier = {
            nom_evenement: data.nom_evenement,
            date_debut: data.date_debut,
            date_fin: data.date_fin,
            description: data.description,
            idMoniteur: data.idMoniteur,
            idVoiture:data.idVoiture,
            idUser:data.idUser,
            type:data.type
            
        };
        const result  = await this.calendrierService.updateCalendrier(idEvenement, calendrierToUpdate);
        if (typeof result === 'string') {
            throw new HttpException(result, HttpStatus.CONFLICT);
          }
          return result;
    }
    @UseGuards(AuthMiddleware)

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async postCalendrier(@Body() postData: any, @Req() req: Request & { user: { sub: number } }): Promise<Calendrier> {
        const sub = req.user.sub;
        console.log("postData", postData);
        const result = await this.calendrierService.createCalendrier(postData, Number(sub));
    
        if (typeof result === 'string') {
          throw new HttpException(result, HttpStatus.CONFLICT);
        }
    
        return result;
      }
      @UseGuards(AuthMiddleware)
      @UseGuards(AuthGuard('jwt'))
      @Get('user')
      async getCalendriersByUser(@Req() req: Request & { user: { sub: number,idRole:string } }): Promise<Calendrier[]> {
        const userId = req.user.sub;
        const userole = req.user.idRole;
        console.log('userId',userId)
        console.log('userole',userole)
        return this.calendrierService.getCalendriersByUserId(userId,userole);
      }
      @UseGuards(AuthMiddleware)
      @UseGuards(AuthGuard('jwt'))
      @Get('historiqe')
      async getHistory(@Req() req: Request & { user: { sub: number,idRole:string } }): Promise<Calendrier[]> {
        const userId = req.user.sub;
        const userole = req.user.idRole;
        console.log('userId',userId)
        console.log('userole',userole)
        return this.calendrierService.getHistory(userId,userole);
      }
      @UseGuards(AuthMiddleware)
      @UseGuards(AuthGuard('jwt'))
      @Get('Event')
      async getEvent(@Req() req: Request & { user: { sub: number,idRole:string } }): Promise<Calendrier[]> {
        const userId = req.user.sub;
        const userole = req.user.idRole;
        console.log('userId',userId)
        console.log('userole',userole)
        return this.calendrierService.getEvent(userId,userole);
      }
      @UseGuards(AuthMiddleware)
      @UseGuards(AuthGuard('jwt'))
      @Get('getAllCalendrier/:id')
      async getAllCalendrier(@Param('id') idUser: number): Promise<Calendrier[]> {
        return this.calendrierService.getAllCalendrier(Number(idUser));
      }
}