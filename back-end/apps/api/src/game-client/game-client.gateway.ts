import { ClientProxy, Payload } from '@nestjs/microservices';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { KeyEventDto } from './dtos/key-event.dto';
import { Inject, Logger, UseFilters } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { AllWsExceptionsFilter } from '../chat-client/filters/AllWsException.filter';
import { IGameFinish } from './interfaces/game-finish.interface';
import { AchievementsService } from '../achievement-client/achievements.service';
import { JwtPayload } from '../common/interfaces';
import { JwtService } from '@nestjs/jwt';

@UseFilters(new AllWsExceptionsFilter())
@WebSocketGateway({
  path: '/lobby',
  serveClient: false,
  cors: {
    origin: `http://${process.env.HOST}:5173`,
    credentials: true,
  },
})
export class GameClientGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject('GAME_SERVICE') private game: ClientProxy,
    private schedulerRegistry: SchedulerRegistry,
    private achievements: AchievementsService,
    private readonly jwtService: JwtService,
  ) {}

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameClientGateway.name);

  /**
   * Handle new connection, add user to game and join room.
   * Starts game interval if not already started.
   *
   * @param client Socket client
   * @emits game.update.spectators
   */
  async handleConnection(client: Socket) {
    client.handshake.auth.token = this.getUserId(client);
    if (client.handshake.auth.token === -1) {
      client.disconnect();
      return;
    }
    const user_id = client.handshake.auth?.token as string;
    const room = client?.handshake?.query?.gameId as string;

    const game_id = parseInt(room);
    try {
      const user = await firstValueFrom(
        this.game.send('ws.client.connect', {
          game_id,
          user_id,
          id: client.id,
        }),
      );

      client.join(room);

      this.addInterval(room);

      const event = await firstValueFrom(
        this.game.send('ws.game.spectators', user.game_id),
      );
      this.server.to(room).emit('game.update.spectators', event);
    } catch (e) {
      this.server.to(client.id).emit('error', e);
      this.logger.debug(e);
      this.logger.log(
        `${client.id}: invalid connection request for user ${user_id}`,
      );
    }
  }

  /**
   * Handle disconnection, remove user from game and leave room.
   * Emits game update spectators event to room.
   *
   * @param client Socket client
   * @emits game.update.spectators
   */
  async handleDisconnect(client: Socket) {
    try {
      const user = await firstValueFrom(
        this.game.send('ws.client.disconnect', client.id),
      );

      const event = await firstValueFrom(
        this.game.send('ws.game.spectators', user.game_id),
      );
      this.server.to('' + event.game_id).emit('game.update.spectators', event);
    } catch (e) {
      this.logger.debug(e);
      this.logger.log(`${client.id}: invalid disconnection request`);
    }
  }

  /**
   * Handle key being pressed up by player.
   *
   * @param data KeyEventDto
   * @emits key.press.up
   */
  @SubscribeMessage('key.press.up')
  async OnKeyPressUp(
    @Payload() data: KeyEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { game_id, user_id } = data;
    await firstValueFrom(
      this.game.send('ws.game.key.update', {
        id: client.id,
        user_id,
        game_id,
        event: 'press',
        key: 'up',
      }),
    );
  }

  /**
   * Handle key being pressed down by player.
   *
   * @param data KeyEventDto
   * @emits key.press.down
   */
  @SubscribeMessage('key.press.down')
  async OnKeyPressDown(
    @Payload() data: KeyEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { game_id, user_id } = data;
    await firstValueFrom(
      this.game.send('ws.game.key.update', {
        id: client.id,
        user_id,
        game_id,
        event: 'press',
        key: 'down',
      }),
    );
  }

  /**
   * Handle up key being released by player.
   *
   * @param data KeyEventDto
   * @emits key.release.up
   */
  @SubscribeMessage('key.release.up')
  async OnKeyReleaseUp(
    @Payload() data: KeyEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { game_id, user_id } = data;
    await firstValueFrom(
      this.game.send('ws.game.key.update', {
        id: client.id,
        user_id,
        game_id,
        event: 'release',
        key: 'up',
      }),
    );
  }

  /**
   * Handle down key being released by player.
   *
   * @param data KeyEventDto
   * @emits key.release.up
   */
  @SubscribeMessage('key.release.down')
  async OnKeyReleaseDown(
    @Payload() data: KeyEventDto,
    @ConnectedSocket() client: Socket,
  ) {
    const { game_id, user_id } = data;
    await firstValueFrom(
      this.game.send('ws.game.key.update', {
        id: client.id,
        user_id,
        game_id,
        event: 'release',
        key: 'down',
      }),
    );
  }

  /**
   * Starts game interval if not already started.
   * Emits game update event to room.
   *
   * @param data GameEventDto
   * @emits game.update
   */
  async addInterval(name: string) {
    try {
      this.schedulerRegistry.getInterval(name);
    } catch {
      const limit = 16.6666666667;
      const callback = async () => {
        const dt = 0.0166666667;
        const gameObj = await firstValueFrom(
          this.game.send('ws.game.update', {
            game_id: +name,
            dt,
          }),
        );
        this.server.to(name).emit('game.update', gameObj);
        if (gameObj.game_state === 'FINISHED') {
          try {
            this.schedulerRegistry.deleteInterval(name);
            // try to put this outside the try and catch block
            const finishedGame: IGameFinish = await firstValueFrom(
              this.game.send('ws.game.finish', +name),
            );
            if (!finishedGame?.game) return;

            const { ladder, game } = finishedGame;
            this.server.to(name).emit('game.winner.update', ladder);
            await this.achievements.achievementsUsersUpdateMany(game);
          } catch {}
        } else if (gameObj.game_state === 'START') {
          await firstValueFrom(this.game.send('ws.game.start', +name));
        }
      };

      const interval = setInterval(callback, limit);
      this.schedulerRegistry.addInterval(name, interval);
    }
  }

  getUserId(client: Socket): number {
    const access_token = client.handshake.headers.cookie
      ?.split('; ')
      ?.find((cookie: string) => cookie.startsWith('access_token'))
      ?.split('=')[1];
    if (!access_token) return -1;
    const payload: JwtPayload = this.jwtService.verify(access_token);
    return payload.sub;
  }
}
