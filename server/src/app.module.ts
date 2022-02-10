import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { config } from './utils';

@Module({
  imports: [
    MongooseModule.forRoot(config.MONGO_URI, {
      user: config.MONGO_INITDB_ROOT_USERNAME,
      pass: config.MONGO_INITDB_ROOT_PASSWORD,
    }),
    GraphQLModule.forRoot({
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
      },
      installSubscriptionHandlers: true,
      path: '/api/v1/graphql',
      cors: false,
      buildSchemaOptions: {
        dateScalarMode: 'timestamp',
      },
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
