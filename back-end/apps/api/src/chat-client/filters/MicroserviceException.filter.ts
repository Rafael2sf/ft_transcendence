import { Catch, ArgumentsHost, HttpServer } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Response } from 'express';
import { STATUS_CODES } from 'http';

@Catch()
export class MicroserviceExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly appRef: HttpServer) {
    super(appRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    if (host.getType() == 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      if (exception.code === 'ECONNREFUSED') {
        response.status(503).json({
          statusCode: 503,
          message: 'Try again',
          error: 'Service Unavailable',
        });
        return;
      } else if (exception.statusCode) {
        const { statusCode, message, error } = exception;
        response.status(statusCode).json({ statusCode, message, error });
        return;
      }
    }
    super.catch(exception, host);
  }
}

@Catch()
export class AllExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    return super.catch(
      new RpcException({
        statusCode: exception?.error?.statusCode ?? 500,
        message: exception?.error?.message ?? 'Server error',
        error: exception?.error?.error ?? STATUS_CODES[500],
      }),
      host,
    );
  }
}
