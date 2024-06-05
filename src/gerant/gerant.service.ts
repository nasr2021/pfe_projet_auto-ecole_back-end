import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class GerantService{
    constructor(private prismaservice:PrismaService){}
}