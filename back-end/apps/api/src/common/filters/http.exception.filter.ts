import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { STATUS_CODES } from 'http';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private logger: Logger = new Logger('HttpExceptoionFilter');

  catch(exception: any, host: ArgumentsHost) {
    const statusCode =
      exception?.response?.statusCode ?? exception?.status ?? 500;
    this.logger.debug(exception);
    return super.catch(
      new HttpException(
        {
          statusCode,
          message: exception?.response?.message ?? 'Server error',
          error: STATUS_CODES[statusCode],
          ...exception.response,
        },
        statusCode,
      ),
      host,
    );
  }
}
