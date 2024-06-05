import { Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
// import { TarifService } from "./tarif.service";
import { AuthGuard } from "@nestjs/passport";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
// import { tarif } from "./tarif.model";
import { TarifDto } from "./dto";
import { TarifService } from "./tarif.service";
import { service, tarification } from "@prisma/client";
import { ServiceDto } from "src/service/dto";
// import { tarification } from "@prisma/client";

@Controller('api/tarif')

export class TarifController {
    constructor(private tarifService: TarifService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Post()
    async addTarification(
        @Body('nom') nom: string,
        @Body('tarif') tarif: number,
        @Req() req: Request & { user: { sub: number,idRole } }
    ): Promise<tarification> {
        const userId = req.user.sub;
    const role=req.user.idRole
        if (!userId) {
            throw new UnauthorizedException('User ID not found in request');
        }
    
        return this.tarifService.addTarification(Number(userId), nom, Number(tarif),role);
    }
    
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Delete(':idService')
    async deleteTarification( @Req() req: Request & { user: { sub: number } }, @Param('idService') idService: number): Promise<void> {
        const idUser = req.user.sub;
      
        await this.tarifService.deleteTarification(idService, idUser);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Put(':idService')
    async updateTarification(
        @Param('idService') idService: number,
        @Req() req: Request & { user: { sub: number } },
        @Body() tarifDto: TarifDto
    ): Promise<tarification> {
        const idUser = req.user.sub;
        return this.tarifService.updateTarification(idService, idUser, tarifDto);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllTarificationsWithServices(@Req() req: Request & { user: { sub: number,idRole } }): Promise<tarification[]> {
        const idUser = req.user.sub;
        const role = req.user.idRole;
        return this.tarifService.getAllTarificationsWithServices(Number(idUser),role);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get(':idService')
    async getTarificationWithService( @Req() req: Request & { user: { sub: number } }, @Param('idService') idService: number): Promise<tarification> {
        const idUser = req.user.sub;
        return this.tarifService.getTarificationWithService(idService, idUser);
    }
}