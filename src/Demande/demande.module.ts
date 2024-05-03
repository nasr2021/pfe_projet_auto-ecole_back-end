import { PrismaService } from "src/prisma/prisma.service";
import { DemandeController } from "./demande.controller";
import { DemandeService } from "./demande.service";
import { Module } from "@nestjs/common";

@Module({
    controllers:[DemandeController],
    providers:[DemandeService,PrismaService]
})
export class DemandModule{}