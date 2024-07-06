import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AutoEcoleService, userWithStats } from "./autoecole.service";
import { autoecole } from "./autoecole.model";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/auth.guard";
import { AutoecoleDto } from "./dto";

@Controller('api/autoecole')

export class AutoEcoleController {
      
    constructor(private autoecoleService: AutoEcoleService) {}
     @UseGuards(AuthMiddleware)
     @UseGuards(AuthGuard('jwt'))
    @Post()
    async createAutoEcole(@Body() autoEcoleData: AutoecoleDto, @Req() req: AuthenticatedRequest): Promise<autoecole> {
    
      console.log('req.user', req.user);
      const idCompteConnecte = req.user?.idUser;
     const addecole= this.autoecoleService.createAutoEcole(autoEcoleData,idCompteConnecte);
   console.log('addecole', addecole);
   return addecole;
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get('statistiques')
    async getStatestique(@Req() req: Request & { user: { sub: number } }): Promise<autoecole | string> {
      const idCompteConnecte = req.user.sub;
      return this.autoecoleService.getStatestique(Number(idCompteConnecte));
    }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get('StatestiqueSuperAdmin')
async getStatestiqueSuperAdmin(): Promise<autoecole> {   

   return this.autoecoleService.getStatestiqueSuperAdmin();

}

@UseGuards(AuthMiddleware)
@UseGuards(AuthGuard('jwt'))
@Get('getUserStatestique')
async getUserStatestique(): Promise<userWithStats[]> {
  return this.autoecoleService.getUserStatestique();
}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Put(':id')
    async updateAutoEcole(
      @Param('id') id: number,
      @Body() updatedAutoEcoleData: Partial<AutoecoleDto>,
    ): Promise<autoecole> {
      const ecoleUpdated= this.autoecoleService.updateAutoEcole(id, updatedAutoEcoleData);
    console.log('ecoleUpdated', ecoleUpdated);
    return ecoleUpdated;
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Delete(':id')
    async deleteAutoEcole(@Param('id') id: number): Promise<void> {
      return this.autoecoleService.deleteAutoEcole(id);
    }
    
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllAutoEcoles(): Promise<autoecole[]> {
      const ecole= this.autoecoleService.getAllAutoEcoles();
      console.log('ecole', ecole)
      return ecole;
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getAutoEcoleById(@Param('id') id: number): Promise<autoecole> {
      return this.autoecoleService.getAutoEcoleById(id);
    }
}