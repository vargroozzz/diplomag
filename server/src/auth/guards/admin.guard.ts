import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming JwtAuthGuard has populated this

    if (user && user.isAdmin) {
      return true;
    }
    throw new ForbiddenException('Access denied. Admin privileges required.');
  }
} 