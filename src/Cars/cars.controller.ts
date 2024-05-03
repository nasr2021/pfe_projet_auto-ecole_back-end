import { Controller, Get, Param, Post, Body, Put, Delete, Req, UseGuards } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Cars } from './cars.model';
import { AuthMiddleware, AuthenticatedRequest } from 'src/auth/AuthMiddleware';
import { AuthGuard } from '@nestjs/passport';

@Controller('cars')
export class CarsController {
  constructor(private carsService: CarsService) {}
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllCars(): Promise<Cars[]> {
    return this.carsService.getAllCars();
  }
  // @UseGuards(AuthMiddleware)
  // @UseGuards(AuthGuard('jwt'))
  // @Get(':id')
  // async getCarById(@Param('id') id: number): Promise<Cars> {
  //   return this.carsService.getCarById(id);
  // }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get('autoecole') 
async getAllCarsByAutoEcoleId(@Req() req: AuthenticatedRequest): Promise<Cars[]> {
  const userId = req.user?.idUser;
  return this.carsService.getAllCarsByAutoEcoleId(userId);
}
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createCar(@Body() carData: Cars,@Req() req: AuthenticatedRequest): Promise<Cars> {
    const userId = req.user.idUser;
    return this.carsService.createCar(carData,userId);
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateCar(@Param('id') id: number, @Body() carData: Partial<Cars>): Promise<Cars> {
    return this.carsService.updateCar(id, carData);
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteCar(@Param('id') id: number): Promise<void> {
    return this.carsService.deleteCar(id);
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get('status/:status')
async getCarsByStatus(@Param('status') status: string): Promise<Cars[]> {
    
    const boolStatus = status === 'true';

    return this.carsService.getCarsByStatus(boolStatus);
}

}
