import { Injectable } from '@nestjs/common';
import { Achievement, AchievementUser, Prisma, User } from '@prisma/client';
import { PrismaService } from '../utils/prisma/prisma.service';

@Injectable()
export class AchievementsRepository {
  private readonly achievementInclude = { achievements_users: true };
  private readonly achievementUserInclude = { achievement: true };

  constructor(private readonly prisma: PrismaService) {}

  async achievementsGetMany(
    where: Prisma.AchievementWhereInput,
    orderBy?: Prisma.AchievementOrderByWithRelationInput,
    take?: number,
  ): Promise<Achievement[]> {
    return await this.prisma.achievement.findMany({
      where,
      orderBy,
      take,
      include: this.achievementInclude,
    });
  }

  async achievementCreateOne(
    data: Prisma.AchievementCreateInput,
  ): Promise<Achievement> {
    return await this.prisma.achievement.create({
      data,
      include: this.achievementInclude,
    });
  }

  async achievementGetUnique(
    where: Prisma.AchievementWhereUniqueInput,
  ): Promise<Achievement> {
    return await this.prisma.achievement.findUniqueOrThrow({
      where,
      include: this.achievementInclude,
    });
  }

  async achievementUpdateOne(
    where: Prisma.AchievementWhereUniqueInput,
    data: Prisma.AchievementUpdateInput,
  ): Promise<Achievement> {
    return await this.prisma.achievement.update({
      where,
      data,
      include: this.achievementInclude,
    });
  }

  async achievementDeleteOne(
    where: Prisma.AchievementWhereUniqueInput,
  ): Promise<any> {
    const { id } = where;
    return await this.prisma.$transaction([
      this.prisma.achievementUser.deleteMany({
        where: { achievement_id: id },
      }),
      this.prisma.achievement.delete({
        where,
      }),
    ]);
  }

  async achievementsUsersGetMany(
    where: Prisma.AchievementUserWhereInput,
    orderBy?: { [key: string]: 'asc' | 'desc' },
    take?: number,
  ): Promise<AchievementUser[]> {
    return await this.prisma.achievementUser.findMany({
      where,
      orderBy,
      take,
      include: this.achievementUserInclude,
    });
  }

  async achievementUserCreateOne(
    data: Prisma.AchievementUserUncheckedCreateInput,
  ): Promise<AchievementUser> {
    return await this.prisma.achievementUser.create({
      data,
      include: this.achievementUserInclude,
    });
  }

  async achievementUserGetUnique(
    where: Prisma.AchievementUserWhereUniqueInput,
  ): Promise<AchievementUser> {
    return await this.prisma.achievementUser.findUniqueOrThrow({
      where,
      include: this.achievementUserInclude,
    });
  }

  async achievementUserUpdateOne(
    where: Prisma.AchievementUserWhereUniqueInput,
    data: Prisma.AchievementUserUncheckedUpdateInput,
  ): Promise<AchievementUser> {
    return await this.prisma.achievementUser.update({
      where,
      data,
      include: this.achievementUserInclude,
    });
  }

  async achievementUserDeleteOne(
    where: Prisma.AchievementWhereUniqueInput,
  ): Promise<any> {
    return await this.prisma.achievementUser.delete({
      where,
      include: this.achievementUserInclude,
    });
  }

  async achievementUserUpsert(
    where: Prisma.AchievementUserWhereUniqueInput,
    create: Prisma.AchievementUserUncheckedCreateInput,
    update: Prisma.AchievementUserUncheckedUpdateInput,
  ) {
    return await this.prisma.achievementUser.upsert({
      where,
      create,
      update,
    });
  }

  async userGetUnique(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where,
    });
  }

  async gamesUsersGetMany(
    where: Prisma.GameUserWhereInput,
    orderBy?: { [key: string]: 'asc' | 'desc' },
    take?: number,
  ) {
    return await this.prisma.gameUser.findMany({ where, orderBy, take });
  }

  async usersGetMany(
    where: Prisma.UserWhereInput,
    orderBy?:
      | { [key: string]: 'asc' | 'desc' }
      | { [key: string]: 'asc' | 'desc' }[],
    take?: number,
  ) {
    return await this.prisma.user.findMany({ where, orderBy, take });
  }
}
