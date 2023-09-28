import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Game, GameUser, Prisma, User } from '@prisma/client';
import { GameRepository } from './game.repository';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { IGamesGetMany } from './interfaces/games.interface';
import { IGamesUsersGetMany } from './interfaces/games-users.interface';
import {
  IGameSessionCreate,
  IGameSessionGetMany,
} from './interfaces/games-sessions.interface';
import {
  IWsGameUpdate,
  IWsKeyEvent,
  IWsSpecEvent,
  IWsUser,
} from './interfaces/games-events.interface';
import { IUpdateUserStatus } from './interfaces/update-user-status.interface';
import { RpcError } from './utils/errors';
import { IPong } from './pong/interfaces/pong.interface';
import { GameService } from './game.service';
import { WsUser } from './entities/ws-user.entity';
import { IFinish } from './pong/interfaces/finished.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { IGameFinish } from './interfaces/game-finish.interface';

@UseInterceptors(new LoggingInterceptor())
@Controller()
export class GameController {
  constructor(
    private readonly repo: GameRepository,
    private readonly game: GameService,
  ) {}

  @MessagePattern('games.get.many')
  async gamesGetMany(data: IGamesGetMany): Promise<Game[]> {
    const { filter, limit, sort } = data;
    const where: Prisma.GameWhereInput = Object.assign(
      filter?.user_id
        ? { games_users: { some: { user_id: filter.user_id } } }
        : {},
      {
        id: filter?.id,
        scope: filter?.scope,
        state: filter?.state,
        max_score: filter?.max_score,
        started_at: { gte: filter?.started_at },
        ended_at: { lte: filter?.ended_at },
      },
    );
    const orderBy = { [sort.field]: sort.order };
    return await this.repo.gamesGetMany(where, orderBy, limit);
  }

  @MessagePattern('games.create.one')
  async gamesCreateOne(data: Prisma.GameCreateInput): Promise<Game> {
    return await this.repo.gamesCreateOne(data);
  }

  @MessagePattern('games.get.unique')
  async gamesGetUnique(id: number): Promise<Game> {
    return await this.repo.gamesGetUnique({ id });
  }

  @MessagePattern('games.update.one')
  async gamesUpdateOne(
    payload: Prisma.GameUpdateInput & { id: number },
  ): Promise<Game> {
    const { id, ...data } = payload;
    await this.gamesGetUnique(id);
    return await this.repo.gamesUpdateOne({ id }, data);
  }

  @MessagePattern('games.delete.one')
  async gamesDeleteOne(id: number): Promise<Game> {
    await this.gamesGetUnique(id);
    return await this.repo.gamesDeleteOne({ id });
  }

  @MessagePattern('games.users.get.many')
  async gamesUsersGetMany(data: IGamesUsersGetMany): Promise<GameUser[]> {
    const { filter, limit, sort } = data;
    const where = {
      id: filter?.id,
      user_id: filter?.user_id,
      game_id: filter?.game_id,
      won: filter?.won,
      score: filter?.score,
    };
    const orderBy = { [sort.field]: sort.order };
    return await this.repo.gamesUsersGetMany(where, orderBy, limit);
  }

  @MessagePattern('games.users.create.one')
  async gamesUsersCreateOne(
    data: Prisma.GameUserUncheckedCreateInput,
  ): Promise<GameUser> {
    await this.gamesGetUnique(data.game_id);
    await this.usersGetUnique(data.user_id);
    return await this.repo.gamesUsersCreateOne(data);
  }

  @MessagePattern('games.users.get.unique')
  async gamesUsersGetUnique(id: number): Promise<GameUser> {
    return await this.repo.gamesUsersGetUnique({ id });
  }

  @MessagePattern('games.users.update.one')
  async gamesUsersUpdateOne(
    payload: Prisma.GameUserUncheckedUpdateInput & { id: number },
  ): Promise<GameUser> {
    const { id, ...data } = payload;
    await this.gamesUsersGetUnique(id);
    if (data?.user_id) await this.usersGetUnique(data.user_id as number);
    if (data?.game_id) await this.gamesGetUnique(data.game_id as number);
    return await this.repo.gamesUsersUpdateOne({ id }, data);
  }

  @MessagePattern('games.users.delete.one')
  async gamesUsersDeleteOne(id: number): Promise<GameUser> {
    await this.gamesUsersGetUnique(id);
    return await this.repo.gamesUsersDeleteOne({ id });
  }

  @MessagePattern('games.sessions.get.many')
  async gamesSessionsGetMany(data: IGameSessionGetMany): Promise<Game[]> {
    const { sort, limit } = data;
    const orderBy = { [sort.field]: sort.order };
    const where: Prisma.GameWhereInput = {
      state: { not: 'FINISHED' },
      scope: 'PUBLIC',
    };
    return await this.repo.gamesGetMany(where, orderBy, limit);
  }

  @MessagePattern('games.sessions.create.one')
  async gamesSessionsCreateOne(data: IGameSessionCreate): Promise<Game> {
    await this.userInGameThrow(data.user_id);

    const { scope, max_score } = data;
    const game = await this.gamesCreateOne({ scope, max_score });

    const { user_id, tex, tex_type } = data;
    const game_id = game.id;
    return await this.gameSessionAddGameUser({
      user_id,
      game_id,
      tex,
      tex_type,
    });
  }

  @MessagePattern('games.sessions.get.unique')
  async gamesSessionsGetUnique(id: number): Promise<Game> {
    const games = await this.repo.gamesGetMany({
      id,
      state: { not: 'FINISHED' },
    });
    if (games.length === 0) RpcError(404, '[404]: No Game found');
    return games[0];
  }

  @MessagePattern('games.sessions.join.random')
  async gamesSessionsJoinRandom(
    where: Prisma.GameUserUncheckedCreateInput,
  ): Promise<Game> {
    await this.userInGameThrow(where.user_id);
    const game = await this.gameFindOrCreate();
    return this.gameSessionAddGameUser({
      game_id: game.id,
      ...where,
    });
  }

  @MessagePattern('games.sessions.join.id')
  async gamesSessionsJoinId(
    where: Prisma.GameUserUncheckedCreateInput & { game_id: number },
  ): Promise<Game> {
    const { user_id } = where;
    await this.userInGameThrow(user_id);
    return this.gameSessionAddGameUser(where);
  }

  @MessagePattern('games.sessions.delete.one')
  async gamesSessionsDeleteOne(id: number) {
    const games = await this.repo.gamesGetMany({
      id,
      state: { not: 'FINISHED' },
    });
    if (games.length === 0) RpcError(404, '[404]: No Game found');
    return await this.repo.gamesDeleteOne({ id });
  }

  @MessagePattern('ws.client.connect')
  async wsClientConnect(user: IWsUser): Promise<WsUser> {
    await this.usersGetUnique(user.user_id);
    const tmp = this.game.userGetUnique(user.user_id);
    if (tmp?.id) {
      console.warn(
        `[409]: User already connected ${tmp.user_id} ${tmp.game_id}`,
      );
      RpcError(
        409,
        `[409]: User already connected ${tmp.user_id} ${tmp.game_id}`,
      );
    }

    const games = await this.repo.gamesGetMany({
      id: user.game_id,
      state: { not: 'FINISHED' },
    });
    if (games.length === 0) RpcError(404, '[404]: No Game found');

    const session = this.game.sessionFindOrCreate(user.game_id, {
      maxScore: games[0].max_score,
    });

    const gamesUsers = await this.repo.gamesUsersGetMany({
      user_id: user.user_id,
      game_id: user.game_id,
    });
    if (gamesUsers.length === 0) {
      this.game.userAdd({ role: 'spectator', ...user });
    } else {
      this.game.userAdd({ role: 'player', ...user });
      session.playerAdd(user.user_id);
      this.updateUserStatus({ status: 'IN_GAME', id: user.user_id });
    }
    return this.game.userGetUnique(user.user_id);
  }

  @MessagePattern('ws.game.start')
  async wsGameStart(game_id: number): Promise<Game> {
    return this.repo.gamesUpdateOne(
      { id: game_id },
      { started_at: new Date(), state: 'IN_PROGRESS' },
    );
  }

  @MessagePattern('ws.game.update')
  async wsGameUpdate(data: IWsGameUpdate): Promise<IPong> {
    const gameObj = this.game.sessionUpdate(data.game_id, data.dt);
    if (!gameObj) RpcError(404, '[404]: No Game found');
    return gameObj;
  }

  @MessagePattern('ws.game.finish')
  async wsGameFinish(game_id: number): Promise<IGameFinish> {
    const session = this.game.sessionGetUnique(game_id);
    if (!session) RpcError(404, '[404]: No Game found');

    const data: IFinish = session.finish();
    const { action, id, user1, user2 } = data;

    if (action === 'delete') {
      await this.repo.gamesDeleteOne({ id });
      return {};
    }
    delete data.action;

    const games_users: Prisma.GameUserUpdateManyWithoutGameNestedInput = {
      update: [
        {
          where: {
            game_id_user_id: {
              game_id,
              user_id: user1.id,
            },
          },
          data: {
            won: user1.won,
            score: user1.score,
          },
        },
        {
          where: {
            game_id_user_id: {
              game_id,
              user_id: user2.id,
            },
          },
          data: {
            won: user2.won,
            score: user2.score,
          },
        },
      ],
    };
    await this.repo.gamesUpdateOne(
      { id },
      {
        ended_at: new Date(),
        state: 'FINISHED',
        games_users,
      },
    );

    // get user ladder event
    const user = await this.repo.usersGetUnique({
      id: user1.won ? user1.id : user2.id,
    });

    return {
      ladder: {
        user_id: user.id,
        new_ladder: user.ladder + 10,
      },
      game: data,
    };
  }

  @MessagePattern('ws.game.key.update')
  async wsGameKeyUpdate(keyEvent: IWsKeyEvent): Promise<IWsKeyEvent> {
    const user = this.game.userGetUnique(keyEvent.user_id);
    if (!user) RpcError(404, '[404]: No User found');
    if (
      user.role != 'player' ||
      !this.game.userMatches(keyEvent.id, keyEvent.user_id)
    ) {
      RpcError(403, '[403]: Forbidden');
    }

    const session = this.game.sessionGetUnique(keyEvent.game_id);
    if (!session) RpcError(404, '[404]: No Game found');

    if (keyEvent.event === 'press') {
      session.keyDown(keyEvent.user_id, keyEvent.key);
    } else {
      session.keyUp(keyEvent.user_id, keyEvent.key);
    }
    return keyEvent;
  }

  @MessagePattern('ws.game.spectators')
  async wsGameSpectators(game_id: number): Promise<IWsSpecEvent> {
    const specs = this.game.sessionGetSpecs(game_id);
    return {
      game_id: game_id,
      spec_number: specs.length,
    };
  }

  @MessagePattern('ws.client.disconnect')
  async gameSessionClientDisconnect(id: string): Promise<WsUser> {
    // checking if user exists
    const user = this.game.userGetUnique(id);
    if (!user) RpcError(404, '[404]: No User found');

    if (user.role === 'player') {
      // removing player from session
      const session = this.game.sessionGetUnique(user.game_id);
      if (!session) RpcError(404, '[404]: No Game found');
      session.playerRemove(user.user_id);
      this.updateUserStatus({ status: 'ONLINE', id: user.user_id });
    }
    this.game.userRemove(user.id);
    return user;
  }

  async usersGetUnique(id: number): Promise<User> {
    return await this.repo.usersGetUnique({ id });
  }

  async userInGameThrow(user_id: number) {
    await this.usersGetUnique(user_id);
    const games = await this.repo.gamesGetMany({
      games_users: { some: { user_id } },
      state: { not: 'FINISHED' },
    });
    if (games.length > 0) RpcError(409, '[409]: User already in a game');
  }

  async gameSessionAddGameUser(
    data: Prisma.GameUserUncheckedCreateInput,
  ): Promise<Game> {
    // TODO: improve on this function
    const { game_id: id } = data;
    const games = await this.repo.gamesGetMany({
      id,
      state: 'WAITING_FOR_PLAYERS',
    });
    if (games.length > 0) {
      await this.repo.gamesUsersCreateOne(data);

      const gamesUsers = await this.repo.gamesUsersGetMany({ game_id: id });
      if (gamesUsers.length == 2) {
        await this.repo.gamesUpdateOne({ id }, { state: 'READY_TO_PLAY' });
      }
    }
    return await this.repo.gamesGetUnique({ id });
  }

  async gameFindOrCreate(): Promise<Game> {
    const games = await this.repo.gamesGetMany({
      state: 'WAITING_FOR_PLAYERS',
    });
    if (games.length === 0) {
      return this.repo.gamesCreateOne({
        max_score: 11,
        scope: 'PUBLIC',
      });
    }
    return games[0];
  }

  async updateUserStatus(payload: IUpdateUserStatus) {
    const user = await this.usersGetUnique(payload.id);
    if (payload.status === 'ONLINE') {
      // check if user is in_game, and if so, update to online
      if (user.status === 'IN_GAME') {
        return await this.repo.usersUpdateOne(
          { id: payload.id },
          { status: 'ONLINE' },
        );
      }
    } else {
      // update to in_game
      return await this.repo.usersUpdateOne(
        { id: payload.id },
        { status: 'IN_GAME' },
      );
    }
    return user;
  }

  @OnEvent('update.user.ladder', { async: true })
  async updateUserLadder(id: number) {
    await this.usersGetUnique(id);
    return await this.repo.usersUpdateOne(
      { id },
      { ladder: { increment: 10 } },
    );
  }
}
