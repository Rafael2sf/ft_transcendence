import { Module, forwardRef } from '@nestjs/common';
import { GameClientController } from './game-client.controller';
import { GameClientGateway } from './game-client.gateway';
import {
  ClientProviderOptions,
  ClientsModule,
  Transport,
} from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';
import { AchievementsService } from '../achievement-client/achievements.service';
import { AchievementsModule } from '../achievement-client/achievements.module';
import { UserModule } from '../user-client/user/user.module';

const GameClientOptions: ClientProviderOptions = {
  name: 'GAME_SERVICE',
  transport: Transport.TCP,
  options: {
    host: 'game',
    port: 3002,
  },
};

@Module({
  imports: [
    forwardRef(() => UserModule),
    ClientsModule.register([GameClientOptions]),
    ScheduleModule.forRoot(),
    AchievementsModule,
  ],
  controllers: [GameClientController],
  providers: [GameClientGateway, AchievementsService],
})
export class GameClientModule {}
