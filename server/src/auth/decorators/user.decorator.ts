import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator<unknown, { userId: string; email: string }>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user
  },
); 