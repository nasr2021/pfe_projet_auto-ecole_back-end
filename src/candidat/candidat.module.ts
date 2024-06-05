import { PrismaService } from "src/prisma/prisma.service";

import { Module } from "@nestjs/common";
import { candidatService } from "./candidat.service";
import { CandidatController } from "./candidat.controller";


@Module({
    controllers:[CandidatController],
    providers:[candidatService,PrismaService]
})
export class CandidatModule{}