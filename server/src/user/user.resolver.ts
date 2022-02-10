import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserDocument } from './schema/user.schema';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query()
  getUsers() {
    return this.userService.getUsers();
  }
  @Query()
  getUser(@Args('id') id: string) {
    return this.userService.getUser(id);
  }
  @Mutation()
  createUser(@Args('input') input: UserDocument) {
    return this.userService.createUser(input);
  }
  @Mutation()
  deleteAllUsers() {
    return this.userService.deleteAllUsers();
  }
}
