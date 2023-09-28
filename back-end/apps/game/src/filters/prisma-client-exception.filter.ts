import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { STATUS_CODES } from 'http';

type PrismaErrorCodes = {
  [key: string]: number;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseRpcExceptionFilter {
  private readonly codes: PrismaErrorCodes = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
  };

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const statusCode = this.codes[exception.code];
    const message = `[${statusCode}]: ${this.exceptionShortMessage(
      exception.message,
    )}`;

    if (!Object.keys(this.codes).includes(exception.code)) {
      return super.catch(exception, host);
    }

    return super.catch(
      new RpcException({
        statusCode,
        message,
        error: STATUS_CODES[statusCode],
      }),
      host,
    );
  }

  private exceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));

    return shortMessage
      .substring(shortMessage.indexOf('\n'))
      .replace(/\n/g, '')
      .trim();
  }
}
