import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class VendorRolesGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.role === 'vendor') {
      return true;
    }
    return false;
  }
}
export class AdminRolesGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user.role === 'admin') {
      return true;
    }
    return false;
  }
}