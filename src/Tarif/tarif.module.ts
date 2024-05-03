import { PrismaService } from "src/prisma/prisma.service";

import { Module } from "@nestjs/common";
import { TarifController } from "./tarif.controller";
import { TarifService } from "./tarif.service";

@Module({
    controllers:[TarifController],
    providers:[TarifService,PrismaService]
})
export class TarifModule{}