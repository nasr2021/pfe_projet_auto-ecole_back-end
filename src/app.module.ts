import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthMiddleware } from './auth/AuthMiddleware';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PackModule } from './Pack/pack.module';
import { CalendrierModule } from './Calendrier/calendrier.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AutoEcoleModule } from './AutoEcole/autoecole.module';
import { TarifModule } from './Tarif/tarif.module';
import { CarsModule } from './Cars/cars.module';
import { ServiceModule } from './service/service.module';
import { GerantModule } from './gerant/gerant.module';
import { CandidatModule } from './candidat/candidat.module';
import { DemandModule } from './Demande/demande.module';
import * as bodyParser from 'body-parser';
import { MulterModule } from '@nestjs/platform-express';
import { NotificationModule } from './notification/Notificatio.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule,
    AuthModule,
    UserModule,

    PackModule,
    CalendrierModule,
    AutoEcoleModule,
    TarifModule,
    CarsModule,
    ServiceModule,
    GerantModule,
    CandidatModule,
    DemandModule,
    NotificationModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'assets'),
      serveRoot: '/assets',
    }),   
    MulterModule.register({
      dest: './uploads', 
    }), 
  ],
  controllers: [AppController],
  providers: [AppService, AuthService],
  
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

  }
  
}


