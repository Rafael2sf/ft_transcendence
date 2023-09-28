import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private eventEmitter: EventEmitter2) {
    super();
    this.$use(this.ladderMiddleware());
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
  ladderMiddleware<
    T extends Prisma.BatchPayload = Prisma.BatchPayload,
  >(): Prisma.Middleware {
    return async (
      params: Prisma.MiddlewareParams,
      next: (params: Prisma.MiddlewareParams) => Promise<T>,
    ): Promise<T> => {
      const result = await next(params);

      if (params.action === 'update' && params.model === 'Game') {
        if (params.args.data?.state === 'FINISHED') {
          const { update } = params.args.data?.games_users;
          if (update[0].data?.won) {
            this.eventEmitter.emit(
              'update.user.ladder',
              update[0].where?.game_id_user_id?.user_id,
            );
          } else {
            this.eventEmitter.emit(
              'update.user.ladder',
              update[1].where?.game_id_user_id?.user_id,
            );
          }
        }
      }
      return result;
    };
  }
}
