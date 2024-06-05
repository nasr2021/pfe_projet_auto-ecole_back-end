import { PrismaService } from "src/prisma/prisma.service";

import { Module } from "@nestjs/common";
import { GerantService } from "./gerant.service";
import { GerantController } from "./gerant.controller";

@Module({
    controllers:[GerantController],
    providers:[GerantService,PrismaService]
})
export class GerantModule{}