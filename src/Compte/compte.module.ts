import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CompteService } from "./compte.service";
import { CompteController } from "./compte.controller";

@Module({
    controllers:[CompteController],
    providers:[CompteService,PrismaService]
})
export class CompteModule{}