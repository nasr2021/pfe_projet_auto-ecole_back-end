import { PrismaService } from "src/prisma/prisma.service";

import { Module } from "@nestjs/common";
import { AutoEcoleController } from "./autoecole.controller";
import { AutoEcoleService } from "./autoecole.service";

@Module({
    controllers:[AutoEcoleController],
    providers:[AutoEcoleService,PrismaService]
})
export class AutoEcoleModule{}