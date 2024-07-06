import { Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { NotificationService } from "./NotificationService";
import { AuthMiddleware } from "src/auth/AuthMiddleware";
import { AuthGuard } from "@nestjs/passport";
import { notification } from "@prisma/client";
@Controller('api/notif')
export class NotificationController {
    constructor(private notificationService: NotificationService) {}
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Get()
    async getNotificationsByUserId(@Req() req: Request & { user: { sub: number}}): Promise<notification[]> {
        const idCompteConnecte = req.user.sub;
        return this.notificationService.getNotificationsByUserId(Number(idCompteConnecte));
    }
    @UseGuards(AuthMiddleware)
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateNotification(@Param('id') idNotification: string): Promise<notification> {
      return this.notificationService.updateNotification(Number(idNotification));
    }
}