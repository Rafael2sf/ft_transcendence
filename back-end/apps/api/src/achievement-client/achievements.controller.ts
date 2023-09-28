import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { LimitQueryPipes } from '../chat-client/pipes/pipes';
import { FilterAchievementDto } from './dtos/achievement.dto';
import {
  SortAchievementsPipe,
  SortAchievementsUsersPipe,
} from './pipes/sort.pipe';
import { FilterAchievementUserDto } from './dtos/achievement-user.dto';
import { PrismaExceptionFilter } from '../common/filters';

@UseFilters(PrismaExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller()
export class AchievementsController {
  constructor(private readonly service: AchievementsService) {}

  @Get('/achievements/')
  async getAchievements(
    @Query('filter') filter: FilterAchievementDto,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortAchievementsPipe)
    sort: { field: string; order: 'asc' | 'desc' },
  ) {
    return await this.service.achievementsGetMany({ filter, limit, sort });
  }

  @Get('/achievements/:id/')
  async getAchievement(@Param('id', ParseIntPipe) id: number) {
    return await this.service.achievementGetUnique(id);
  }

  @Get('/achievements_users/')
  async getAchievementsUsers(
    @Query('filter') filter: FilterAchievementUserDto,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortAchievementsUsersPipe)
    sort: { field: string; order: 'asc' | 'desc' },
  ) {
    return await this.service.achievementsUsersGetMany({ filter, limit, sort });
  }

  @Get('/achievements_users/:id/')
  async getAchievementUser(@Param('id', ParseIntPipe) id: number) {
    return await this.service.achievementUserGetUnique(id);
  }

  @Get('/user/:id/achievements')
  async getUserAchievements(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortAchievementsPipe) sort: any,
  ) {
    return this.service.achievementsUsersGetMany({
      filter: { user_id: id },
      sort,
      limit,
    });
  }
}
