import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/user/user.interface';
import { UserDocument } from 'src/user/schema/user.schema';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();

    await super.logIn(request);
    return true;
  }
}

@Injectable()
export class GQLGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const { req } = ctx.getContext();
    return (await super.canActivate(
      new ExecutionContextHost([req]),
    )) as boolean;
  }
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err;
    }
    return user;
  }
}
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );
//     if (!requiredRoles) {
//       return true;
//     }
//     const { user }: { user: UserDocument } = context
//       .switchToHttp()
//       .getRequest();
//     return requiredRoles.some((role) => user?.role?.includes(role));
//   }
// }

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    // const roles = this.reflector.get<string[]>('role', context.getHandler());
    const roles = this.reflector.getAllAndOverride<UserRoleEnum[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx?.getContext().req;
    const restContext = context.switchToHttp().getRequest();

    if (gqlContext) {
      const { user }: { user: UserDocument } = gqlContext;

      const result = roles.some((role) => user?.role?.includes(role));

      return result;
    } else if (restContext) {
      const { user } = restContext;

      const result = roles.some((role) => user?.role?.includes(role));

      return result;
    }
    // console.log('role: ', roles);
    // console.log('context: ', context.switchToHttp().getRequest());
    // console.log('gqlContext: ', ctx.getContext().req);

    // return false;
  }
}
