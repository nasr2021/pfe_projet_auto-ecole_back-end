import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, user } from '@prisma/client';
import * as bcrypt from 'bcrypt'
@Injectable()
export class PrismaService extends PrismaClient implements  OnModuleInit {

   constructor() {
     super({
       datasources: {
         db: {
           url: 'mysql://root:@localhost:3306/autoecole',
         },
       },
     });
 
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
  async onModuleInit() {
    await this.$connect();
  }
 

}
