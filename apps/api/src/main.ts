/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';

import * as cookieParser from 'cookie-parser';
import * as passport from 'passport';

import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // httpsOptions: {
    //   key: fs.readFileSync(process.env.HTTPS_KEY),
    //   cert: fs.readFileSync(process.env.HTTPS_CERT)
    // }
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // init 'passport' (npm install passport)
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());

  const port = process.env.port || 3333;
  await app.listen(port, () => {
    console.log(`Listening at https://localhost:${port}/${globalPrefix}`);
  });
}

bootstrap().then(() => {});
