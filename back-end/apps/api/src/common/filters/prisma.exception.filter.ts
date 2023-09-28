import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { HttpStatus } from '@nestjs/common';

type Codes = {
  [key: string]: HttpStatus;
};

type Errors = {
  [key: string]: string;
};

type PrismaClientError =
  | Prisma.PrismaClientUnknownRequestError
  | Prisma.PrismaClientKnownRequestError;

const UNKNOWN_ERROR_CODE = 'unknown';

const errors: Errors = {
  P2000: 'Bad request parameters',
  P2002: 'Unique constraint failed',
  P2025: 'No such object in database',
  UNKNOWN_ERROR_CODE: 'Unknown ORM error happened',
};

const codes: Codes = {
  P2000: HttpStatus.BAD_REQUEST,
  P2002: HttpStatus.CONFLICT,
  P2025: HttpStatus.NOT_FOUND,
  UNKNOWN_ERROR_CODE: HttpStatus.INTERNAL_SERVER_ERROR,
};

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private logger: Logger = new Logger('ORM'); // TODO: inject auth service instead and pick a logger from there

  catch(exception: PrismaClientError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const prisma_code: string | undefined = (
      exception as Prisma.PrismaClientKnownRequestError
    )?.code; // assume it is known, otherwise - undefined

    const http_code: HttpStatus = codes[prisma_code ?? UNKNOWN_ERROR_CODE];
    const error_msg: string = errors[prisma_code ?? UNKNOWN_ERROR_CODE];

    this.logger.error(
      JSON.stringify({
        statusCode: http_code,
        timestamp: new Date().toISOString(),
        message: error_msg,
        path: request.url,
      }),
    );

    response.status(http_code).json({
      statusCode: http_code,
      message: error_msg,
    });
  }
}
