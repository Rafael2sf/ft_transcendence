import { RpcException } from '@nestjs/microservices';
import { STATUS_CODES } from 'http';

export function RpcError(statusCode: number, message: string | string[]) {
  throw new RpcException({
    statusCode,
    message,
    error: STATUS_CODES[statusCode],
  });
}
