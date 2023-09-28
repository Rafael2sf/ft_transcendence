import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { Logger } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtPayload } from '../../common/interfaces';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // private readonly loggers: Mapping<string, Logger> = {}
  private readonly loggers: Map<string, Logger> = new Map(); //TODO: inject logging service

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const http: HttpArgumentsHost = ctx.switchToHttp();
    const { method, originalUrl } = http.getRequest();
    const response: Response = http.getResponse();
    Request;
    const body = http.getRequest().body;
    const user: JwtPayload | User = http.getRequest().user;

    response.on('finish', () => {
      const name: string = ctx.getClass().name;

      if (!this.loggers.has(name)) this.loggers.set(name, new Logger(name));
      const logger: Logger = this.loggers.get(name);

      // Who made the request
      logger.debug(JSON.stringify(user, null, 2));
      // What he wanted
      logger.log(`${method} ${originalUrl} ${name} ${response.statusCode}`);
      // What payload he had if any
      logger.debug(JSON.stringify(body, null, 2));
    });
    return next.handle();
  }
}
