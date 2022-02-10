import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserDocument } from 'src/user/schema/user.schema';
import { AuthService } from './auth.service';
import { CurrentUser, GQLGuard } from 'src/strategies/jwt.guard';

@Resolver('Auth')
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(GQLGuard)
  @Query()
  me(@CurrentUser() user: UserDocument) {
    return user;
  }
  @Mutation()
  verifyToken(@Args('token') token: string) {
    return this.authService.verifyToken(token);
  }
  @Query()
  verifyToChangePassword(@Args('token') token: string, @Args('id') id: string) {
    return this.authService.verifyToChangePassword({ id, emailToken: token });
  }
  @Mutation()
  login(@Args('email') email: string, @Args('password') password: string) {
    return this.authService.login({ email, password });
  }
  @Mutation()
  signup(@Args('input') input: UserDocument) {
    return this.authService.register(input);
  }
  @Mutation()
  resendVerification(@Args('id') id: string) {
    return this.authService.resendVerification(id);
  }

  @Mutation()
  forgotPassword(@Args('email') email: string) {
    return this.authService.forgotPassword(email);
  }
  @Mutation()
  changePassword(@Args('id') id: string, @Args('password') password: string) {
    return this.authService.changePassword({ id, password });
  }
}
