import { Module } from '@nestjs/common';
import { NotificationService } from './NotificationService';// Assurez-vous que le chemin est correct
import { NotificationController } from './Notification.ontroller';

@Module({
    controllers:[NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
