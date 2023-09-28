import { Injectable } from '@nestjs/common';
import { Game, GameUser, Prisma, User } from '@prisma/client';
import { PrismaService } from './utils/prisma.service';

@Injectable()
export class GameRepository {
  private readonly select: Prisma.UserSelect = {
    id: true,
    status: true,
    ladder: true,
    name: true,
    intraname: true,
    picture: true,
    games: true,
  };
  private readonly gameInclude: Prisma.GameInclude = {
    games_users: {
      include: { user: { select: this.select } },
    },
  };
  private readonly gameUserInclude = {
    user: { select: this.select },
    game: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async gamesGetMany(
    where?: Prisma.GameWhereInput,
    orderBy?: { [key: string]: 'asc' | 'desc' },
    take?: number,
  ): Promise<Game[]> {
    return await this.prisma.game.findMany({
      where,
      orderBy,
      take,
      include: this.gameInclude,
    });
  }

  async gamesCreateOne(data: Prisma.GameCreateInput): Promise<Game> {
    return await this.prisma.game.create({
      data,
      include: this.gameInclude,
    });
  }

  async gamesGetUnique(where: Prisma.GameWhereUniqueInput): Promise<Game> {
    return await this.prisma.game.findUniqueOrThrow({
      where,
      include: this.gameInclude,
    });
  }

  async gamesUpdateOne(
    where: Prisma.GameWhereUniqueInput,
    data: Prisma.GameUpdateInput,
  ): Promise<Game> {
    return await this.prisma.game.update({
      where,
      data,
      include: this.gameInclude,
    });
  }

  async gamesDeleteOne(where: Prisma.GameWhereUniqueInput): Promise<any> {
    const { id } = where;
    return await this.prisma.$transaction([
      this.prisma.gameUser.deleteMany({
        where: { game_id: id },
      }),
      this.prisma.game.delete({
        where,
      }),
    ]);
  }

  async gamesUsersGetMany(
    where?: Prisma.GameUserWhereInput,
    orderBy?: { [key: string]: 'asc' | 'desc' },
    take?: number,
  ): Promise<GameUser[]> {
    return await this.prisma.gameUser.findMany({
      where,
      orderBy,
      take,
      include: this.gameUserInclude,
    });
  }

  async gamesUsersCreateOne(
    data: Prisma.GameUserUncheckedCreateInput,
  ): Promise<GameUser> {
    return await this.prisma.gameUser.create({
      data,
      include: this.gameUserInclude,
    });
  }

  async gamesUsersGetUnique(where: Prisma.GameUserWhereUniqueInput) {
    return await this.prisma.gameUser.findUniqueOrThrow({
      where,
      include: this.gameUserInclude,
    });
  }

  async gamesUsersUpdateOne(
    where: Prisma.GameUserWhereUniqueInput,
    data: Prisma.GameUserUncheckedUpdateInput,
  ): Promise<GameUser> {
    return await this.prisma.gameUser.update({
      where,
      data,
      include: this.gameUserInclude,
    });
  }

  async gamesUsersDeleteOne(where: Prisma.GameUserWhereUniqueInput) {
    return await this.prisma.gameUser.delete({
      where,
    });
  }

  async usersGetUnique(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow({
      where,
    });
  }

  async usersUpdateOne(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUncheckedUpdateInput,
  ): Promise<User> {
    return await this.prisma.user.update({ where, data });
  }
}
