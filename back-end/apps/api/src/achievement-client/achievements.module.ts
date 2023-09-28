import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { AchievementsRepository } from './achievements.repository';
import { PrismaService } from '../utils/prisma/prisma.service';

@Module({
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsRepository, PrismaService],
  exports: [AchievementsService, AchievementsRepository],
})
export class AchievementsModule {}
