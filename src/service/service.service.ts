import { Injectable, NotFoundException } from "@nestjs/common";
import { service } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async createService(serviceData: service): Promise<service> {
    return this.prisma.service.create({
      data: serviceData,
    });
  }
  async getAllServices(): Promise<service[]> {
    return this.prisma.service.findMany();
  }
  async findServiceById(idService: number): Promise<service> {
    const service = await this.prisma.service.findUnique({
      where: {   idService: Number(idService)},
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${idService} not found`);
    }
    return service;
  }

  async updateService(idService: number, serviceData: Partial<service>): Promise<service> {
    const existingService = await this.findServiceById(idService);
    return this.prisma.service.update({
      where: { idService:Number(idService) },
      data: serviceData,
    });
  }

  async deleteService(idService: number): Promise<service> {
    const existingService = await this.findServiceById(idService);
    return this.prisma.service.delete({
      where: {  idService:Number(idService) },
    });
  }
}
