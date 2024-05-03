import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as dotenv from 'dotenv';

dotenv.config();
type JwtPayload = {
    username: string;
    sub: number;
    roles: number; 
     
  };
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
   constructor() {
       super({
           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          // ignoreExpiration: false,
          secretOrKey: process.env.JWT_SECRET,
       });
   } 
   validate(payload: JwtPayload) {
    return payload;
}
}
