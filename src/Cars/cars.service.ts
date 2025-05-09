import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Voitures } from "./cars.model";
import { voitures } from "@prisma/client";
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CarsService {
  constructor(private prismaService: PrismaService) {}

  async addCar(carDto: Voitures, userId: number, roleId: string): Promise<Voitures> {
    
    const existingUser = await this.prismaService.user.findUnique({ where: { idUser: Number(userId) } });
    if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
    }


    const role = await this.prismaService.roles.findUnique({ where: { idRole: parseInt(roleId) }, select: { nom_role: true } });
    if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
    }


    if (role.nom_role !== 'ecole') {
        throw new UnauthorizedException('Only schools are allowed to add cars');
    }
    const gerant = await this.prismaService.gerantecole.findFirst({ 
        where: { idGerant: Number(userId) }, 
        select: { autoecole: true } 
    });
    
    if (!gerant || !gerant.autoecole || gerant.autoecole.length < 1 || !gerant.autoecole[0]) {
        throw new NotFoundException(`Second school ID not found for user with ID ${userId}`);
    }
    
  
    const idAutoEcole = gerant.autoecole[0].id;
    console.log('Autoecole ID:', idAutoEcole);
    const currentDate = new Date();
    const createdCar = await this.prismaService.voitures.create({
        data: {
            ...carDto,
            date_creation:currentDate,
            annee:Number(carDto.annee),
            autoecole: { connect: { id: Number(idAutoEcole) } } 
        }
    });

    return createdCar;
}
async updateCar(carId: number, carDto: Voitures): Promise<Voitures> {

  const existingCar = await this.prismaService.voitures.findUnique({ where: { id: Number(carId) } });
  if (!existingCar) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
  }

  const updatedCar = await this.prismaService.voitures.update({
      where: { id: Number(carId) },
      data: { ...carDto }
  });

  return updatedCar;
}
async saveAvatar(base64Data: string): Promise<string> {
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Image, 'base64');
  const avatarDirectory = path.join(__dirname, '..', 'assets');
  const avatarName = `avatar_${Date.now()}.png`;
  const avatarPath = path.join(avatarDirectory, avatarName);

  if (!fs.existsSync(avatarDirectory)) {
    fs.mkdirSync(avatarDirectory, { recursive: true });
  }

  fs.writeFileSync(avatarPath, buffer);
  console.log('service', avatarName)
  return avatarName; 
}

async deleteCar(carId: number): Promise<void> {

  const existingCar = await this.prismaService.voitures.findUnique({ where: { id: carId } });
  if (!existingCar) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
  }

  await this.prismaService.voitures.delete({ where: { id: carId } });
}



async getVoiture(idUser: number): Promise<Voitures[]> {
  const connectedUser = await this.prismaService.gerantecole.findUnique({
      where: { idGerant: Number(idUser) },
      select: {
          autoecole: true,
      },
  });

  if (!connectedUser || !connectedUser.autoecole || connectedUser.autoecole.length === 0) {
      throw new Error(`Impossible de récupérer l'auto-école de l'utilisateur connecté.`);
  }

  const idAutoEcole = Number(connectedUser.autoecole[0].id);
  const cars = await this.prismaService.voitures.findMany({
      where: {
          idAutoEcole: idAutoEcole
      }
  });

  return cars;
}




  async getAllCars(): Promise<Voitures[]> {
    return this.prismaService.voitures.findMany();
  }
  async getAllCarsByUserId(userId: number): Promise<Voitures[]> {

    const gerant = await this.prismaService.gerantecole.findFirst({
        where: { idGerant: Number(userId) },
        select: { autoecole: true }
    });

    if (!gerant || !gerant.autoecole || gerant.autoecole.length === 0) {
        throw new NotFoundException(`User with ID ${userId} is not associated with any auto-école`);
    }

    const idAutoEcole = gerant.autoecole[0].id;

  
    const cars = await this.prismaService.voitures.findMany({
        where: { idAutoEcole:Number(idAutoEcole) }
    });

    return cars;
}


  async getCarById(carId: number): Promise<Voitures> {
    const car = await this.prismaService.voitures.findUnique({
      where: { id: Number(carId) },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    return car;
  }


  // async updateCar(carId: number, carData: Partial<Cars>): Promise<Cars> {
  //   if (typeof carData.statut === 'string') {
  //     carData.statut = carData.statut === 'true';
  //   }
  //   carData.annee = parseInt(carData.annee as unknown as string, 10);
  //   const updatedCar = await this.prismaService.cars.update({
  //     where: { id: Number(carId) },
  //     data: carData,
  //   });

  //   if (!updatedCar) {
  //     throw new NotFoundException(`Car with ID ${carId} not found`);
  //   }

  //   return updatedCar;
  // }


//   async getCarsByStatus(statut: boolean): Promise<Cars[]> {
//     const cars = await this.prismaService.cars.findMany({
//         where: { statut }, 
//     });

//     if (!cars || cars.length === 0) {
//         throw new NotFoundException(`No cars found with status: ${status}`);
//     }

//     return cars;
// }

}