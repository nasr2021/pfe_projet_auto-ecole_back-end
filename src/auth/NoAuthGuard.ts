import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class NoAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return !super.canActivate(context);
  }
}
