import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { PackService } from "./pack.service";
import { Forfait } from "./pack.model";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";

@Controller('api/pack')

export class PackController {
    constructor(private packService: PackService) {}
    @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Get()
async getAllPacks(@Req() request, @Res() response) {
    try {
        const packs = await this.packService.getAllPack();
        return response.status(200).json({
            status: 'success',
            message: 'Pack récupérés avec succès.',
            data: packs,
        });
    } catch (error) {
        return response.status(500).json({
            status: 'error',
            message: 'Une erreur s\'est produite lors de la récupération des packs.',
            error: error.message,
        });
    }
}

// @UseGuards(AuthMiddleware)
// @UseGuards(AuthGuard('jwt'))
// @Get(':idForfait')
// async getPackById(@Param('idForfait') idForfait: number): Promise<Forfait | null> {
//     return this.packService.getPackById(idForfait);
// } 
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
//,RolesGuard)
//@Roles('manager')
@Delete(':idForfait')
async DeletePack(@Param('idForfait') idForfait:number):Promise<Forfait>{
    console.log("ID de Forfait à supprimer:", idForfait); 
    return this.packService.deletePack(idForfait);

}
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'),)
@Put(':idForfait')
async updatePack(@Param('idForfait') id:number,@Body()data:any):Promise<Forfait>{
    return this.packService.updatePack(id,data);

}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Post()
    async postPack(@Body() postData: Forfait, @Req() req: AuthenticatedRequest): Promise<Forfait> {
        const sub = req.user?.idUser; 
        return this.packService.createPack(postData,sub );
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get('/moniteur')
    async getAllPacksByMoniteur(@Req() request,@Req() req: AuthenticatedRequest): Promise<Forfait[]> {
        const sub = req.user?.idUser;
        console.log('sub',sub);
        return await this.packService.getAllPacksByMoniteur(sub);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get('/custom')
async getAllPacksCustom(): Promise<Forfait[]> {
    return await this.packService.getAllPacksCustom();
}
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Get('/except-custom')
async getAllPacksExceptCustom(): Promise<Forfait[]> {
    return await this.packService.getAllPacksExceptCustom();
}
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Post(':packId/acheter')
async acheterPack(@Req() request,@Req() req: AuthenticatedRequest): Promise<void> {
    const userId = req.user?.idUser; 

    const packId = parseInt(request.params['packId'], 10); 

    await this.packService.acheterPack(packId, userId);
}
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Post('demandes/:demandeId/accepter')
    async accepterDemandePack(@Param('demandeId') demandeId: number): Promise<void> {
        await this.packService.accepterDemandePack(demandeId);
    }
}