import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import * as Sentry from '@sentry/node';
import { SentryFilter } from 'src/common/filtres/sentry-exeption.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  Sentry.init({
    dsn: process.env.SENTRY_AUTH_TOKEN,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.use(Sentry.Handlers.requestHandler());
  app.use(helmet());
  app.use(xss());
  app.use(hpp());
  app.use(mongoSanitize());

  const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
  });

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  app.use(limiter);

  await app.listen(3000);
}
bootstrap();
