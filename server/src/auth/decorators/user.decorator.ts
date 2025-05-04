import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/schemas/user.schema';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): { userId: string; email: string } => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 