import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

type AuthenticatedUser = {
  id: string;
  email: string;
  isAdmin?: boolean;
};

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser; params: { id: string } }>();
    const user = request.user;
    const targetId = request.params.id;

    if (!user) {
      throw new ForbiddenException();
    }

    if (user.isAdmin) {
      return true;
    }

    if (user.id !== targetId) {
      throw new ForbiddenException();
    }

    return true;
  }
}
