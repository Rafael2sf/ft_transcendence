import {
  INestApplication,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
// import { PrismaMiddleware } from './middlewares/prisma.middleware';

type PrismaNextFunction = (params: Prisma.MiddlewareParams) => Promise<any>;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new Logger('ORM');
  constructor() {
    super({
      // log: ['error', 'info', 'warn', 'query'] // prisma built-in logs
      // log: [{ emit: "event", level: "query" }]
    });
    this.logMiddleware = this.logMiddleware.bind(this); // this gets lost in middlewares sometimes...

    this.logger.log(`Prisma v${Prisma.prismaVersion.client}`);
    this.$use(this.logMiddleware); // prisma supports native middleware
  }
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async logMiddleware(
    params: Prisma.MiddlewareParams,
    next: PrismaNextFunction,
  ): Promise<any> {
    const before = Date.now();

    const result = await next(params);

    this.logger.debug(JSON.stringify(params.action, null, 2));
    this.logger.debug(JSON.stringify(params.args, null, 2));

    const after = Date.now();

    console.debug(
      `Query ${params.model}.${params.action} took ${after - before}ms`,
    );

    return result;
  }
}
