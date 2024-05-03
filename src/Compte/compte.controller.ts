import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CompteService } from './compte.service';
import { AuthGuard } from '@nestjs/passport';
import { Compte } from './compte.model';
import { AuthMiddleware } from 'src/auth/AuthMiddleware';
import { compte } from '@prisma/client';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('api/compte')

export class CompteController {
   
    constructor(private compteService: CompteService) {}
    @UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Get()
async getAllComptes(@Req() request, @Res() response) {
    try {
        const comptes = await this.compteService.getAllCompte();
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


    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get(':idCompte')
    async getCompteById(@Param('idCompte') idCompte: number): Promise<Compte | null> {
        return this.compteService.getCompteById(idCompte);
    } 
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Post('compteEcole')
    @HttpCode(HttpStatus.CREATED)
    async creationWithDataCompte(@Body() data:any):Promise<Compte>{
        try {
            return await this.compteService.creationWithDataCompte(data);
        } catch (error) {
            console.error('Failed to create account:', error);
            // Gérer l'erreur ici
        }
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Post('randomCompte')
    async createRandomCompte(): Promise<Compte> {
        return await this.compteService.createRandomCompte();
    }
   // @UseGuards(AuthMiddleware)
  //  @UseGuards(AuthGuard('jwt'))
    //,RolesGuard)
    //@Roles('manager')
    @Delete(':idUser')
    async DeleteCompte(@Param('idUser') idUser:number):Promise<Compte>{
        console.log("ID de l'utilisateur à supprimer:", idUser); 
        return this.compteService.deleteOneCompteWithAccountFalse(idUser);

    }
  //  @UseGuards(AuthMiddleware)
  //  @UseGuards(AuthGuard('jwt'),)
    @Put(':id')
    async updateCompte(@Param('id') id:number,@Body()data:any):Promise<Compte>{
        return this.compteService.updateCompte(id,data);

    }
}

