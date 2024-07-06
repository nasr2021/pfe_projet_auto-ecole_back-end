import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from 'src/prisma/prisma.service';
import { notification } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {
  } 
  
  async getNotificationsByUserId(userId: number): Promise<notification[]> {
    const notifications = await this.prismaService.notification.findMany({
      where: {
        idUser: Number(userId),
      },
      include:{
        user:{
          include:{
            condidat:{
              include:{
                autoecole:true
              }
            }
          }
        },
        calendrier:true
      }
     
    });
  console.log('notifications', notifications)
  notifications.map(notification => ({
    ...notification,
    date_creation: this.formatDate(notification.date_creation),

}));
    return notifications;
  }
  private formatDate(date: string | Date): string {
    if (typeof date === 'string') {
      // Assuming date is in ISO format 'yyyy-mm-ddThh:mm:ss'
      const parts = date.split('T');
      return parts[0] + ' ' + parts[1].substring(0, 5); // Adjust to 'yyyy-mm-dd hh:mm'
    } else if (date instanceof Date) {
      const year = date.getFullYear();
      const month = this.padNumber(date.getMonth() + 1);
      const day = this.padNumber(date.getDate());
      const hours = this.padNumber(date.getHours());
      const minutes = this.padNumber(date.getMinutes());
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } else {
      throw new Error('Invalid date format');
    }
  }
  
  private padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }
  sendNotification = async (userId: number, token: string, title: string, body: string) => {
    try {
      const user = await this.prismaService.user.findUnique({ where: { idUser: userId } });
      if (!user || !user.firebaseToken) {
        console.error(`User with id ${userId} has no valid Firebase token.`);
        return;
      }
  
      const message = {
        notification: {
          title,
          body,
        },
        token: user.firebaseToken, // Utiliser le token Firebase du user trouvé dans la base de données
      };
  
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  async updateNotification(idNotification: number): Promise<notification> {
    const updatedNotification = await this.prismaService.notification.update({
      where: { idNotification },
      data: {
        lu: true,
      },
    });

    return updatedNotification;
  }
}
