import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();
export interface AuthenticatedRequest extends Request {
  user?: { 
    idRole: string; 
    idUser: number;  
    username: string; 
  };
}
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
   
    if (!token) {
      throw new UnauthorizedException('Token JWT introuvable dans les en-têtes de la demande');
    }

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
      console.log('Données extraites du token JWT :', {
        idRole: decodedToken.idRole,
        idUser: decodedToken.sub,
        username: decodedToken.username
      });

  
      if (!decodedToken.idUser || !decodedToken.sub || !decodedToken.username) {
        throw new UnauthorizedException('Informations manquantes dans le token JWT');
      }

      
      req.user = {
        idRole: decodedToken.idRole,
        idUser: parseInt(decodedToken.sub, 10), 
        username: decodedToken.username,
      };

      console.log('Token JWT décrypté avec succès :', decodedToken);
      next();
    } catch (error) {
      console.error('Erreur lors du décryptage du token JWT :', error);
      throw new UnauthorizedException('Impossible de décoder le token JWT');
    }
  }
}
