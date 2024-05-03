import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
import { TarifService } from "./tarif.service";
import { AuthGuard } from "@nestjs/passport";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { Tarif } from "./tarif.model";


@Controller('api/tarif')

export class TarifController {
      
    constructor(private tarifService: TarifService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt')) 
    @Get()
    async getTarifsByUserConnecte(@Req() req: AuthenticatedRequest): Promise<Tarif[]> {
        const userId = req.user?.idUser; 
        return this.tarifService.getTarifsByUserConnecte(userId);
    }

    @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt')) 
    @Post()
    async createTarif(@Body() tarifData: Tarif, @Req() req: AuthenticatedRequest): Promise<Tarif> {
        const userId = req.user?.idUser; 
        return this.tarifService.createTarif(tarifData, userId);
    }

    @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt')) 
    @Put()
    async updateOrCreateTarif(@Body() tarifData: Tarif, @Req() req: AuthenticatedRequest): Promise<Tarif> {
        const userId = req.user?.idUser; 
        return this.tarifService.updateOrCreateTarif(tarifData, userId);
    }

    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt')) 
    @Delete()
    async deleteTarifsByUserConnecte(@Req() req: AuthenticatedRequest): Promise<void> {
        const userId = req.user?.idUser; 
        return this.tarifService.deleteTarifsByUserConnecte(userId);
    }
}