import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LimitQueryPipes } from '../chat-client/pipes/pipes';
import { SortGamesPipe, SortGamesUsersPipe } from './pipes/sort.pipes';
import { FilterGameDto } from './dtos/games.dto';
import { FilterGameUserDto } from './dtos/games-users.dto';
import {
  CreateGameSessionDto,
  JoinGameSessionDto,
} from './dtos/game-session.dto';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller()
export class GameClientController {
  constructor(@Inject('GAME_SERVICE') private game: ClientProxy) {}

  /**
   * Returns an array of game objects basic data,
   * with query
   *
   * @param limit? limit number of game records
   * @param sort? sort games records
   * @param filter? filter games records
   */
  @Get('/games/')
  async getGames(
    @Query('filter') filter: FilterGameDto,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortGamesPipe) sort: string,
  ) {
    return this.game.send('games.get.many', { filter, limit, sort });
  }

  /**
   * Returns a game object
   *
   * @param id id of the game
   */
  @Get('/games/:id/')
  async getGame(@Param('id', ParseIntPipe) id: number) {
    return this.game.send('games.get.unique', id);
  }

  /**
   * Returns an array of game_user objects basic data
   * corresponding to game record, with query
   *
   * @param id id of the game
   * @param limit? limit number of game_user records
   * @param sort? sort game_user records
   */
  @Get('/games/:id/games_users/')
  async getGamesUsersByGame(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortGamesUsersPipe) sort: string,
  ) {
    return this.game.send('games.users.get.many', {
      filter: { game_id: id },
      limit,
      sort,
    });
  }

  /**
   * Returns an array of game objects basic data
   * corresponding to user_id with query
   *
   * @param id id of the game
   * @param filter? filter games records
   * @param limit? limit number of games records
   * @param sort? sort games records
   */
  @Get('user/:id/games')
  async getUserGames(
    @Param('id', ParseIntPipe) id: number,
    @Query('filter') filter: FilterGameDto,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortGamesPipe) sort: string,
  ) {
    return this.game.send('games.get.many', {
      filter: Object.assign(filter, { user_id: id }),
      sort,
      limit,
    });
  }

  /**
   * Returns an array of active game sessions objects basic data
   * corresponding to user_id with query
   *
   * @param id id of the game
   * @param filter? filter games records
   * @param limit? limit number of games records
   * @param sort? sort games records
   */
  @Get('user/:id/games_sessions')
  async getUserGamesSessions(
    @Param('id', ParseIntPipe) id: number,
    @Query('filter') filter: FilterGameDto,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortGamesPipe) sort: string,
  ) {
    return this.game.send('games.get.many', {
      filter: Object.assign(filter, {
        user_id: id,
        state: { not: 'FINISHED' },
      }),
      sort,
      limit,
    });
  }

  /**
   * Returns an array of game_user objects basic data,
   * with query
   *
   * @param limit? limit number of game_user records
   * @param sort? sort game_user records
   * @param filter? filter game_user records
   */
  @Get('/games_users/')
  async getGamesUsers(
    @Query('filter') filter: FilterGameUserDto,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortGamesUsersPipe) sort: string,
  ) {
    return this.game.send('games.users.get.many', { filter, limit, sort });
  }

  /**
   * Returns a game_user object
   *
   * @param id id of the game_user
   */
  @Get('/games_users/:id/')
  async getGameUser(@Param('id', ParseIntPipe) id: number) {
    return this.game.send('games.users.get.unique', id);
  }

  /**
   * Returns an array of game objects currently being played,
   * with query
   *
   * @param limit? limit number of game_user records
   * @param sort? sort game_user records
   */
  @Get('/games_sessions/')
  async getGameSessionAvailable(
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('sort', ...SortGamesPipe) sort: string,
  ) {
    return this.game.send('games.sessions.get.many', { limit, sort });
  }

  /**
   * Start a game session
   *
   * @param body game data
   */
  @Post('/games_sessions/')
  async createGameSession(
    @CurrentUser() user: User,
    @Body() body: CreateGameSessionDto,
  ) {
    if (user.id !== body.user_id) {
      throw new ForbiddenException(
        '[403]: User cannot create a game for another user',
      );
    }
    return this.game.send('games.sessions.create.one', body);
  }

  /**
   * Returns a game_user object
   *
   * @param id id of the game_user
   */
  @Get('/games_sessions/:id/')
  async getGameSession(@Param('id', ParseIntPipe) id: number) {
    return this.game.send('games.sessions.get.unique', id);
  }

  /**
   * Adds a new player to a random game running session
   *
   * @param body game join data
   */
  @Patch('/games_sessions/random/')
  async joinRandomGameSession(
    @CurrentUser() user: User,
    @Body() body: JoinGameSessionDto,
  ) {
    if (user.id !== body.user_id) {
      throw new ForbiddenException(
        '[403]: User cannot create a game for another user',
      );
    }
    return this.game.send('games.sessions.join.random', body);
  }

  /**
   * Adds a new player to a specific game running session
   *
   * @param body game join data
   */
  @Patch('/games_sessions/:id/')
  async joinGameSession(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: JoinGameSessionDto,
  ) {
    if (user.id !== body.user_id) {
      throw new ForbiddenException(
        '[403]: User cannot create a game for another user',
      );
    }
    return this.game.send('games.sessions.join.id', { game_id: id, ...body });
  }
}
