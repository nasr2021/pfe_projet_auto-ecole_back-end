import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
   constructor() {
       super({
           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
           secretOrKey: process.env.JWT_SECRET,
           passReqToCallback: true
       });
   } 

   async validate(req: Request, payload: any) {
    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const refreshToken = authorizationHeader.replace('Bearer', '').trim();

    return { ...payload, refreshToken };
   }
}
