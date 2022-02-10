import { CacheModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { config } from '../utils';

@Module({
  providers: [AuthResolver, AuthService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: config.SECRET,
    }),
    CacheModule.register(),
  ],
})
export class AuthModule {}
