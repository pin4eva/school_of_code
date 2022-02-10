import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import MongoStore = require('connect-mongo');
import { config } from './utils';
import { Logger, ValidationPipe } from '@nestjs/common';

const devOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
];
const prodOrigins = [
  'https://admin.helar.law',
  'https://helar.law',
  'http://front.helar.law',
  'http://153.92.210.10',
  /\.helar.law\.org$/,
];

const origin = process.env.NODE_ENV === 'production' ? prodOrigins : devOrigins;

Logger.log('mongodb uri:', config.MONGO_URI);

async function bootstrap() {
  const PORT = process.env.PORT || 8000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
    // logger: true,
  });

  app.enableCors({
    origin,
    credentials: true,
  });

  app.use(cookieParser());
  app.use(
    session({
      secret: config.SECRET,
      name: '__helar',
      saveUninitialized: false,
      resave: false,
      store: MongoStore.create({
        mongoUrl: config.MONGO_URI,
        ttl: 2 * 24 * 60 * 60,
        autoRemove: 'native',
        // mongoOptions: mongooseOption,
      }),
    }),
  );
  app.use(express.json({ limit: '50mb' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/v1');

  await app.listen(PORT, () => {
    Logger.log(`server started on port ${PORT}`);
  });
}
bootstrap();
