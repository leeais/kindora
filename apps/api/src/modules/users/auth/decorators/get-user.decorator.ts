import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the user object from the Request.
 * This is safer and cleaner than using @Req() req and accessing req.user.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof Express.User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as Express.User;

    return data ? user?.[data] : user;
  },
);
