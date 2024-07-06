import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationService } from "src/notification/NotificationService";

@Module({
    controllers:[UserController],
    providers:[UserService,PrismaService,NotificationService]
})
export class UserModule{}