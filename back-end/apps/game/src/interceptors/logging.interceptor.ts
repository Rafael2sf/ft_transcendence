import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Event');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToRpc();
    if (ctx.getContext().args[1] !== 'ws.game.update') {
      this.logger.log(ctx.getContext().args[1]);
      this.logger.debug(
        JSON.stringify({
          ...ctx.getData(),
          _metadata: undefined,
        }),
      );
    }
    return next.handle();
  }
}
