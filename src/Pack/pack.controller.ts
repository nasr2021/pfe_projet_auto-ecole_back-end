import { Body, Controller, Delete, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { PackService } from "./pack.service";
import { Forfait } from "./pack.model";
import { ApiSecurity, ApiTags } from "@nestjs/swagger";
import { PackDto } from "./dto";

@Controller('api/pack')

export class PackController {
    constructor(private packService: PackService) {}
//     @UseGuards(AuthMiddleware)
// @UseGuards(AuthGuard('jwt'))
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

 @UseGuards(AuthMiddleware)
 @UseGuards(AuthGuard('jwt'))
@Get(':idForfait')
async getPackById(@Param('idForfait') idForfait: number): Promise<Forfait | null> {
    return this.packService.getForfaitById(idForfait);
} 
@UseGuards(AuthMiddleware)
 @UseGuards(AuthGuard('jwt'))
@Post()
async createOrUpdateForfait(@Body() forfaitDto: PackDto): Promise<Forfait> {
    console.log('forfaitDto', forfaitDto)
    return this.packService.createOrUpdateForfait(forfaitDto);
}
@Delete(':id')
async deleteForfait(@Param('id') forfaitId: string): Promise<void> {
    const id = parseInt(forfaitId, 10);

    try {
        await this.packService.deleteForfait(id);
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw new NotFoundException(error.message);
        }
        throw error; 
    }
}
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Post(':packId/acheter')
async acheterPack(@Req() request,@Req() req: Request & { user: { sub: number} }): Promise<void |string> {
    const userId = req.user.sub; 
console.log(' req.user.sub', req.user.sub)
    const packId = parseInt(request.params['packId'], 10); 

    await this.packService.acheterPack(packId, userId);
}
@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Post('demandes/:demandeId/accepter')
    async accepterDemandePack(@Param('demandeId') demandeId: number,@Body() firebaseToken: string ): Promise<string> {
        const result = this.packService.accepterDemandePack(demandeId, firebaseToken);
        return result
     
    }
    @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
 @Post('custom')
async createCustomForfait(@Body() forfaitData: PackDto, firebaseToken:any, @Req() req: Request & { user: { sub: number} }): Promise<Forfait> {
        try {
            const userId = req.user.sub; 
            console.log(' req.user.sub', req.user.sub)
            console.log('forfaitData', forfaitData)
            console.log('firebaseToken', firebaseToken)
            const customForfait = await this.packService.createCustomForfait(forfaitData, Number(userId), firebaseToken);
            return customForfait;
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Post('demandes/:demandeId/refuser')
    async refuserDemandePack(@Param('demandeId') demandeId: number, @Body() firebaseToken:any): Promise<void> {
        await this.packService.refuserDemandePack(demandeId, firebaseToken);
    }

    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Post('updateEvent')
    async updateEvent(
      @Body() data: any,
      @Req() req: Request & { user: { sub: number } },
    ): Promise<any> {
      const sub = req.user.sub;
      console.log('postData', data);
      try {
        const demande = await this.packService.createDemande(Number(sub), data);
        return demande;
      } catch (error) {
        throw new Error(`Failed to create demande: ${error.message}`);
      }
    }
}