import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,  { cors: true });
  const expressApp = app.getHttpAdapter().getInstance();

  expressApp.set('view engine', 'ejs');
  expressApp.set('views', 'views');
  app.useGlobalPipes(new ValidationPipe());
  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true,
  };
  
  app.enableCors(corsOptions);
  await app.listen(3001);
}
bootstrap();
