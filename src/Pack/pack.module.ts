import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { PackService } from "./pack.service";
import { PackController } from "./pack.controller";

@Module({
    controllers:[PackController],
    providers:[PackService,PrismaService]
})
export class PackModule{}