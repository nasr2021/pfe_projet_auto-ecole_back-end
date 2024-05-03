import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AutoEcoleService } from "./autoecole.service";
import { autoecole } from "./autoecole.model";
import { AuthMiddleware, AuthenticatedRequest } from "src/auth/AuthMiddleware";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/auth.guard";

@Controller('api/autoecole')

export class AutoEcoleController {
      
    constructor(private autoecoleService: AutoEcoleService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Post()
    async createAutoEcole(@Body() autoEcoleData: autoecole, @Req() req: AuthenticatedRequest): Promise<autoecole> {
      console.log('req.user', req.user);
      const idCompteConnecte = req.user?.idUser;
      return this.autoecoleService.createAutoEcole(autoEcoleData,idCompteConnecte);
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'),RolesGuard)
    @Roles('manager')
    @Put(':id')
    async updateAutoEcole(
      @Param('id') id: number,
      @Body() updatedAutoEcoleData: Partial<autoecole>,
    ): Promise<autoecole> {
      return this.autoecoleService.updateAutoEcole(id, updatedAutoEcoleData);
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
      return this.autoecoleService.getAllAutoEcoles();
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getAutoEcoleById(@Param('id') id: number): Promise<autoecole> {
      return this.autoecoleService.getAutoEcoleById(id);
    }
}