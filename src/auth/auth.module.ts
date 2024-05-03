import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';
import * as dotenv from 'dotenv'; 
import { NoAuthGuard } from './NoAuthGuard';
import { AuthMiddleware } from './AuthMiddleware';

dotenv.config(); 

@Module({
  imports: [
    JwtModule.register({
      secret: 'at-secret', 
      signOptions: {
        expiresIn: '1h', 
      },
    }),
  ],
  
  controllers: [AuthController],
  providers: [AuthMiddleware,AuthService, PrismaService,JwtService,AtStrategy,RtStrategy],
})
export class AuthModule {}
