import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from 'src/user/user.interface';

export const ROLES_KEY = 'roles';
export const UseRoles = (...role: UserRoleEnum[]) =>
  SetMetadata(ROLES_KEY, role);
