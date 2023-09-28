import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards';
import { ChatClientModule } from './chat-client/chat-client.module';
import { LogModule } from './utils/log/log.module';
import { UserModule } from './user-client/user/user.module';
import { LoggerMiddleware } from './utils/log/logging.middleware.';
import { GameClientModule } from './game-client/game-client.module';
import { AchievementsModule } from './achievement-client/achievements.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatClientModule,
    GameClientModule,
    AchievementsModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    LogModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  // controllers: [UserController, AuthController],
  // providers: [
  //   UserService,
  //   UserProfile,
  //   PrismaService,
  //   AuthService,
  //   Auth42Service,
  //   ArgonService,
  //   JwtService,
  //   LogService,
  //   Logger,

  // ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
