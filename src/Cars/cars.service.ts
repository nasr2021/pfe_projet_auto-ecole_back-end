import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Cars } from "./cars.model";

@Injectable()
export class CarsService {
  constructor(private prismaService: PrismaService) {}
  async createCar(carData: Cars, userId: number): Promise<Cars> {
    
    const user = await this.prismaService.user.findUnique({
        where: { idUser: userId }
    });

    if (!user || !user.idAutoEcole) {
        throw new Error(`L'utilisateur n'est associé à aucune auto-école.`);
    }
const autoEcoleId = user.idAutoEcole;
if (typeof carData.status === 'string') {
  carData.status = carData.status === 'true';
}
carData.annee = parseInt(carData.annee as unknown as string, 10);
  
    return this.prismaService.cars.create({
        data: {
            ...carData,
            idAutoEcole: autoEcoleId,
            iduserconnecte:userId,
        }
    });
}
  async getAllCars(): Promise<Cars[]> {
    return this.prismaService.cars.findMany();
  }
  async getAllCarsByAutoEcoleId(userId: number): Promise<Cars[]> {
    const user = await this.prismaService.user.findUnique({
        where: { idUser: Number(userId) }
    });

    if (!user || !user.idAutoEcole) {
        throw new Error(`L'utilisateur n'est associé à aucune auto-école.`);
    }

    const autoEcoleId = user.idAutoEcole;

    const cars = await this.prismaService.cars.findMany({
        where: {
            idAutoEcole: Number(autoEcoleId),
        },
    });

    if (!cars || cars.length === 0) {
        throw new NotFoundException(`No cars found for autoEcoleId: ${autoEcoleId}`);
    }

    return cars;
}

  async getCarById(carId: number): Promise<Cars> {
    const car = await this.prismaService.cars.findUnique({
      where: { id: Number(carId) },
    });

    if (!car) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    return car;
  }

  async updateCar(carId: number, carData: Partial<Cars>): Promise<Cars> {
    if (typeof carData.status === 'string') {
      carData.status = carData.status === 'true';
    }
    carData.annee = parseInt(carData.annee as unknown as string, 10);
    const updatedCar = await this.prismaService.cars.update({
      where: { id: Number(carId) },
      data: carData,
    });

    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    return updatedCar;
  }

  async deleteCar(carId: number): Promise<void> {
    const deletedCar = await this.prismaService.cars.delete({
      where: { id: Number(carId) },
    });

    if (!deletedCar) {
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }
  }
  async getCarsByStatus(status: boolean): Promise<Cars[]> {
    const cars = await this.prismaService.cars.findMany({
        where: { status }, 
    });

    if (!cars || cars.length === 0) {
        throw new NotFoundException(`No cars found with status: ${status}`);
    }

    return cars;
}

}