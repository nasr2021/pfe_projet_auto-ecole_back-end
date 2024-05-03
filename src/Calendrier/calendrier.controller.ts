import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CompteService } from "src/Compte/compte.service";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { RolesGuard } from "src/auth/auth.guard";
import { Roles } from "src/auth/roles.decorator";
import { CalendrierService } from "./calendrier.service";
import { Calendrier } from "./calendrier.model";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";

@Controller('api/calendrier')

export class CalendrierController {
      
    constructor(private calendrierService: CalendrierService) {}
 @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Get()
async getAllCalendrier(@Req() request, @Res() response, @Req() req: AuthenticatedRequest) {
    try {console.log('req.user', req.user);
    const idCompteConnecte = req.user?.idUser;
    console.log('idCompteConnecte', idCompteConnecte)
        const comptes = await this.calendrierService.getAllCalendrier(idCompteConnecte);
        return response.status(200).json({
            status: 'success',
            message: 'Comptes récupérés avec succès.',
            data: comptes,
        });
    } catch (error) {
        return response.status(500).json({
            status: 'error',
            message: 'Une erreur s\'est produite lors de la récupération des comptes.',
            error: error.message,
        });
    }
}


    // @UseGuards(AuthMiddleware)
    // @UseGuards(AuthGuard('jwt'))
    // @Get(':idEvenement')
    // async getCalendrierById(@Param('idEvenement') idEvenement: number): Promise<Calendrier | null> {
    //     return this.calendrierService.getCalendrierById(idEvenement);
    // } 
    
    
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Delete(':idEvenement')
    async deleteCalendrier(@Param('idEvenement') idEvenement:number):Promise<Calendrier>{
        console.log("ID de l'utilisateur à supprimer:", idEvenement); 
        return this.calendrierService.deleteCalendrier(idEvenement);

    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),)
    @Put(':idEvenement')
    async updateCalendrier(@Param('idEvenement') idEvenement:number,@Body()data:any):Promise<Calendrier>{
        return this.calendrierService.updateCalendrier(idEvenement,data);

    }
    @UseGuards(AuthMiddleware)

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async postCalendrier(@Body() postData: Calendrier, @Req() req: AuthenticatedRequest): Promise<Calendrier> {
        const sub = req.user?.idUser; 
        return this.calendrierService.createCalendrier(postData,sub);
      }
      
      @UseGuards(AuthMiddleware)
      @UseGuards(AuthGuard('jwt'))
    @Get('autoecole')
    async getAllCalendrierByAutoEcole( @Req() req: AuthenticatedRequest): Promise<Calendrier[]> {
        try { const sub = req.user?.idUser; 
            const calendriers = await this.calendrierService.getAllCalendrierByAutoEcole(sub);
            return calendriers;
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des calendriers de l'auto-école : ${error.message}`);
        }
    }
}