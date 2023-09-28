import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';
import { PrismaService } from './utils/prisma.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [GameController],
  providers: [GameRepository, GameService, PrismaService],
})
export class GameModule {}
