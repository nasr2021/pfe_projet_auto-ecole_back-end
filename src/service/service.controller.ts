import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ServiceDto } from "./dto";
import { service } from "@prisma/client";
import { ServiceService } from "./service.service";
import { AuthGuard } from "@nestjs/passport";
import { AuthMiddleware } from "src/auth/AuthMiddleware";
@Controller('api/Service')

export class ServiceController {
    constructor(private serviceService: ServiceService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getAllServices(): Promise<service[]> {
        return this.serviceService.getAllServices();
    } 
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
  @Post()
  async createService(@Body() data: any): Promise<service> {
    return this.serviceService.createService(data);
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getServiceById(@Param('id') id: number): Promise<service> {
    
      const foundService = await this.serviceService.findServiceById(id);
      if (!foundService) {
          throw new NotFoundException(`Service with ID ${id} not found`);
      }
      return foundService;
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateService(
    @Param('id') id: number,
      @Body() data: ServiceDto
  ): Promise<service> {
      return this.serviceService.updateService(id, data);
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteService( @Param('id') id: number,): Promise<service> {
      return this.serviceService.deleteService(id);
  }

}
      