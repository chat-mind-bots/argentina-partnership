import { ArgumentsHost, Catch, HttpServer } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { AbstractHttpAdapter, BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class SentryFilter extends BaseExceptionFilter {
  handleUnknownError(
    exception: any,
    host: ArgumentsHost,
    applicationRef: HttpServer<any, any> | AbstractHttpAdapter<any, any, any>,
  ): void {
    Sentry.captureException(exception);
    super.handleUnknownError(exception, host, applicationRef);
  }
}
