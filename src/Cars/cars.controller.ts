import { Controller, Get, Param, Post, Body, Put, Delete, Req, UseGuards, UnauthorizedException, NotFoundException, BadRequestException, UploadedFile } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Voitures } from './cars.model';
import { AuthMiddleware, AuthenticatedRequest } from 'src/auth/AuthMiddleware';
import { AuthGuard } from '@nestjs/passport';
import { CarsDto } from './dto';
import { RolesGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('api/cars')
export class CarsController {
  constructor(private carsService: CarsService) {}
  async uploadAvatar(@UploadedFile() file: Express.Multer.File): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }
      console.log('fileback', file)
      const base64Data = file.buffer.toString('base64');
    
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;

      const avatarUrl = await this.carsService.saveAvatar(dataUrl);
      console.log('avatarUrl', avatarUrl)
      return avatarUrl;
  
    } catch (error) {
      console.error('Error uploading avatar:', error.message);
      throw error;
    }
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Get('car/:id')
  async getCarById( @Param('id') carId: number,): Promise<Voitures> {
    const car = await this.carsService.getCarById(carId);
    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }
    return car;
  }

  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createCar(@Body() carDto: CarsDto, @Req() req: Request & { user: { sub: number ,idRole:string} }): Promise<Voitures> {
    console.log('req.user',req.user)  
    const sub = req.user.sub;
      const role = req.user.idRole;
      console.log("sub",sub)
      console.log("role",role)
      if (!sub) {
          throw new UnauthorizedException('User ID not found in request');
      }

      
          return this.carsService.addCar(carDto, sub, role);
          
     
  }
  @Post(':carId/assign/:moniteurId')
  async assignCarToMoniteur(
      @Param('carId') carId: number,
      @Param('moniteurId') moniteurId: number
  ): Promise<Voitures> {
      try {
          const assignedCar = await this.carsService.assignCarToMoniteur(carId, moniteurId);
         console.log('assignedCar',assignedCar)
          return assignedCar;
      } catch (error) {
          throw new NotFoundException(error.message);
      }
  }
  @UseGuards(AuthMiddleware)
  @UseGuards(AuthGuard('jwt'),RolesGuard)
  @Roles('ecole')
  @Put(':id')
  async updateCar(@Param('id') carId: number, @Body() carDto: CarsDto): Promise<Voitures> {
      try {
        console.log('avatar', carDto.image)
          return await this.carsService.updateCar(carId, carDto);
      } catch (error) {
          if (error instanceof NotFoundException) {
              throw new NotFoundException(error.message);
          }
          throw error; 
      }
  }
  @Delete(':id')
  async deleteCar(@Param('id') id: string): Promise<void> {
      await this.carsService.deleteCar(Number(id));
  }
  @UseGuards(AuthGuard('jwt'))
  @Get('autoecole')
  async getAllCarsByUserId(@Req() req: Request & { user: { sub: number} }): Promise<Voitures[]> {
    console.log('req.user',req.user)  
    const sub = req.user.sub;
    return this.carsService.getAllCarsByUserId(sub);
  }
  @Get()
  async getAllCars(): Promise<Voitures[]> {
      return this.carsService.getAllCars();
  }
  @UseGuards(AuthGuard('jwt'))
  @UseGuards(AuthMiddleware)
  @Get('car')
  async getVoiture(@Req() req: Request & { user: { sub: number } }): Promise<Voitures[]> {
    console.log('req.user',req.user)  
    const sub = req.user.sub;
    return this.carsService.getVoiture(Number(sub));
  }
}
