// jwt-auth.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
   
      
    canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('err:', err);
    console.log('user:', user);
    console.log('info:', info);
    if (err || !user) {
      console.log('Unauthorized');
      throw err || new UnauthorizedException();
    }
    return user;
  }
  
}
