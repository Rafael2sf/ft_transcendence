import { Injectable } from '@nestjs/common';
import { Achievement, AchievementUser, Prisma } from '@prisma/client';
import { AchievementGetManyDto } from './dtos/achievement.dto';
import { AchievementsRepository } from './achievements.repository';
import { AchievementUserGetManyDto } from './dtos/achievement-user.dto';
import {
  IAchievementEvent,
  IUserGame,
} from '../game-client/interfaces/game-finish.interface';

@Injectable()
export class AchievementsService {
  constructor(private readonly repo: AchievementsRepository) {}

  async achievementsGetMany(
    data: AchievementGetManyDto,
  ): Promise<Achievement[]> {
    const { filter, sort, limit } = data;
    const where: Prisma.AchievementWhereInput = Object.assign(
      filter?.user_id
        ? {
            achievements_users: { some: { user_id: filter.user_id } },
          }
        : {},
      {
        id: filter?.id,
        title: { contains: filter?.title },
        description: { contains: filter?.description },
        kind: filter?.kind,
      },
    );
    const orderBy = {
      [sort.field]: sort.order,
    };
    return await this.repo.achievementsGetMany(where, orderBy, limit);
  }

  async achievementGetUnique(id: number): Promise<Achievement> {
    return await this.repo.achievementGetUnique({ id });
  }

  async achievementsUsersGetMany(
    data: AchievementUserGetManyDto,
  ): Promise<AchievementUser[]> {
    const { filter, sort, limit } = data;
    const where: Prisma.AchievementUserWhereInput = {
      id: filter?.id,
      achievement_id: filter?.achievement_id,
      user_id: filter?.user_id,
    };
    const orderBy = {
      [sort.field]: sort.order,
    };
    return await this.repo.achievementsUsersGetMany(where, orderBy, limit);
  }

  async achievementUserCreateOne(
    data: Prisma.AchievementUserUncheckedCreateInput,
  ): Promise<AchievementUser> {
    await this.repo.userGetUnique({ id: data.user_id });
    await this.repo.achievementGetUnique({ id: data.achievement_id });
    return await this.repo.achievementUserCreateOne(data);
  }

  async achievementUserGetUnique(id: number): Promise<AchievementUser> {
    return await this.repo.achievementUserGetUnique({ id });
  }

  async achievementUserUpdateOne(
    id: number,
    data: Prisma.AchievementUserUncheckedUpdateInput,
  ): Promise<AchievementUser> {
    return await this.repo.achievementUserUpdateOne({ id }, data);
  }

  async achievementUserDeleteOne(id: number): Promise<any> {
    return await this.repo.achievementUserDeleteOne({ id });
  }

  async achievementsUsersUpdateMany(data: IAchievementEvent) {
    await this.achievementsUsersUpdateLadder();
    await this.achievementsUsersUpdateGame(data?.user1?.id);
    await this.achievementsUsersUpdateGame(data?.user2?.id);
    await this.achievementsUsersUpdateMaxScore(data?.user1, data?.user2);
  }

  async achievementsUsersUpdateLadder() {
    const users = await this.repo.usersGetMany(
      { ladder: { not: 0 }, intraname: { not: 'marvin' } },
      [{ ladder: 'desc' }, { name: 'asc' }],
      3,
    );

    for (let i = 0; i < users.length; i++) {
      const data = {
        user_id: users[i].id,
        achievement_id: i === 0 ? 4 : i === 1 ? 5 : 6,
      };
      await this.repo.achievementUserUpsert(
        { user_id_achievement_id: data },
        data,
        {},
      );
    }
  }

  async achievementsUsersUpdateGame(user_id: number) {
    if (!user_id) return;
    const games = await this.repo.gamesUsersGetMany({ user_id });
    const data = {
      user_id,
      achievement_id: 3,
    };
    if (games.length >= 100) {
      await this.repo.achievementUserUpsert(
        { user_id_achievement_id: data },
        data,
        {},
      );
    } else if (games.length >= 10) {
      data.achievement_id = 2;
      await this.repo.achievementUserUpsert(
        { user_id_achievement_id: data },
        data,
        {},
      );
    } else if (games.length >= 1) {
      data.achievement_id = 1;
      await this.repo.achievementUserUpsert(
        { user_id_achievement_id: data },
        data,
        {},
      );
    }
  }

  async achievementsUsersUpdateMaxScore(user1: IUserGame, user2: IUserGame) {
    if (!user1?.id || !user2?.id) return;

    const win = user1.won ? user1 : user2;
    const lose = user1.won ? user2 : user1;
    if (win.score === 11 && lose.score === 0) {
      const data = {
        user_id: user1.won ? user1.id : user2.id,
        achievement_id: 7,
      };
      await this.repo.achievementUserUpsert(
        { user_id_achievement_id: data },
        data,
        {},
      );
    }
  }
}
