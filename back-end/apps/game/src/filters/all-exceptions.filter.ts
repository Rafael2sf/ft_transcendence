import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { STATUS_CODES } from 'http';

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
