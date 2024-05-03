import { PrismaService } from "src/prisma/prisma.service";
import { CalendrierService } from "./calendrier.service";
import { CalendrierController } from "./calendrier.controller";
import { Module } from "@nestjs/common";

@Module({
    controllers:[CalendrierController],
    providers:[CalendrierService,PrismaService]
})
export class CalendrierModule{}