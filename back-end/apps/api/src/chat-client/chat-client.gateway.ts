import { Inject, Injectable, Logger, UseFilters } from '@nestjs/common';
import { ClientProxy, Payload } from '@nestjs/microservices';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { firstValueFrom } from 'rxjs';
import { ChannelMute, UserState } from '@prisma/client';
import { AllWsExceptionsFilter } from './filters/AllWsException.filter';
import {
  IChannelInfo,
  IChannelMessage,
  IDirect,
  IUserChannelData,
  IUserInfo,
  IUserRole,
} from './interfaces/Chat.interfaces';
import { ICreateMessage } from './interfaces/CreateMessage.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/interfaces';
import { UserService } from '../user-client/user/user.service';

function getMuteState(mute?: ChannelMute): number | undefined {
  const mute_end = mute
    ? new Date(mute.createdAt).getTime() + mute.seconds * 1000
    : undefined;
  return mute_end && mute_end > Date.now() ? mute_end : undefined;
}

@UseFilters(new AllWsExceptionsFilter())
@Injectable()
@WebSocketGateway({
  path: '/chat',
  serveClient: false,
  cors: { origin: `http://${process.env.HOST}:5173`, credentials: true },
})
export class ChatClientGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatClientGateway.name);
  constructor(
    @Inject('CHAT_SERVICE') private readonly chat: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  getUserId(client: Socket): number {
    const access_token = client.handshake.headers.cookie
      ?.split('; ')
      ?.find((cookie: string) => cookie.startsWith('access_token'))
      ?.split('=')[1];
    if (!access_token) return -1;
    const payload: JwtPayload = this.jwtService.verify(access_token);
    return payload.sub;
  }

  @WebSocketServer()
  server: Server;

  /**
   * Remove a specific user from a room
   * @param user_id     user unique identifier attached to the socket
   * @param channel_id  room unique identifier
   */
  async forceRoomLeave(user_id: number, channel_id: string) {
    const sockets = await this.server.in(`u-${user_id}`).fetchSockets();
    for (const socket of sockets) {
      socket.leave(channel_id);
    }
  }

  /**
   * Remove all sockets in a specific channel
   * @param channel_id room unique identifier
   */
  forceRoomDestroy(channel_id: string) {
    this.server.socketsLeave(channel_id);
  }

  @SubscribeMessage('channel.room.join')
  async OnRoomJoin(
    @Payload() channel_id: string,
    @ConnectedSocket() client: Socket,
  ) {
    const id = client?.handshake?.auth?.token;
    // user has already joined
    if (client.rooms.has(channel_id)) return;
    this.logger.log(
      `channel.room.join: ${client.id}, user: ${id}, channel_id: ${channel_id}`,
    );
    // check if user can join
    const { user, channel } = await firstValueFrom(
      this.chat.send<{ user: IUserRole } & { channel: IChannelInfo }>(
        'channel.room.join',
        {
          user_id: parseInt(id),
          channel_id,
        },
      ),
    );
    const sockets = await this.server.in(`u-${id}`).fetchSockets();
    if (sockets.length === 0) {
      // notify users of channel that someone has entered
      client
        .to(channel.id)
        .emit('channel.room.join', { channel_id: channel.id, user });
    }
    // return the channel object to the user
    client.emit('channel.room.join.ack', {
      ...channel,
      user_role: user.role,
      muted: user.muted,
    });
    client.join(channel.id);
  }

  @SubscribeMessage('channel.room.leave')
  async OnRoomLeave(
    @Payload() channel_id: any,
    @ConnectedSocket() client: Socket,
  ) {
    const id = client?.handshake?.auth?.token;
    // if user is subscribed
    if (client.rooms.has(channel_id)) {
      this.logger.log(
        `channel.room.leave: ${client.id}, user_id: ${id}, channel_id: ${channel_id}`,
      );
      client.leave(channel_id);
      // remove user from room and notfy other users
      const sockets = await this.server.in(`u-${id}`).fetchSockets();
      if (sockets.length == 0) {
        // notify users of channel that someone has entered
        client.to(channel_id).emit('channel.room.leave', {
          user_id: parseInt(id),
          channel_id,
        });
      }
    }
  }

  // @SubscribeMessage('channel.message.writing')
  // OnMessageWriting(
  //   @Payload() channel_id: string,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const id = client?.handshake?.auth?.token;
  //   // if room exists
  //   if (client.rooms.has(channel_id)) {
  //     // notify room that user is writing
  //     client.to(channel_id).emit('channel.message.writing', {
  //       user_id: id,
  //       channel_id: channel_id,
  //     });
  //   }
  // }

  // @SubscribeMessage('channel.message.notwriting')
  // OnMessageNotWriting(
  //   @Payload() channel_id: string,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const id = client?.handshake?.auth?.token;
  //   // if room exists
  //   if (client.rooms.has(channel_id)) {
  //     // notify room that user is no longer writing
  //     client.to(channel_id).emit('channel.message.notwriting', {
  //       user_id: id,
  //       channel_id: channel_id,
  //     });
  //   }
  // }

  // direct.message.create

  @SubscribeMessage('channel.message.create')
  async OnChannelMessageCreate(
    @Payload() data: { channel_id: string; text: string; game_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(
      `channel.message.create: ${client.id}, user_id: ${id}, channel_id: ${data.channel_id}`,
    );
    if (data.text.length > 140) {
      throw new WsException({
        statusCode: 413,
        message: 'text must be shorter than or equal to 140 characters',
        error: 'Content Too Large',
      });
    }
    // if user is in room
    if (!client.rooms.has(data.channel_id)) {
      throw new WsException({
        statusCode: 403,
        message: 'Not a member of this room',
        error: 'Forbidden',
      });
    }
    // create message
    const message = await firstValueFrom(
      this.chat.send<IChannelMessage, ICreateMessage>(
        'channel.message.create',
        {
          user_id: parseInt(id),
          channel_id: data.channel_id,
          text: data.text,
          game_id: data.game_id,
        },
      ),
    );

    // emit message to room
    this.server.to(data.channel_id).emit('channel.message.create', {
      ...message,
    });
  }

  @SubscribeMessage('direct.message.create')
  async OnDirectMessageCreate(
    @Payload() data: { intraname: string; text: string; game_id: number },
    @ConnectedSocket() client: Socket,
  ) {
    const id = client?.handshake?.auth?.token;
    this.logger.log(
      `direct.message.create: ${client.id}, user_id: ${id}, intraname: ${data.intraname}`,
    );
    if (data.text.length > 1000) {
      throw new WsException({
        statusCode: 413,
        message: 'text must be shorter than or equal to 1000 characters',
        error: 'Content Too Large',
      });
    }
    // create message
    const { user, target, message } = await firstValueFrom(
      this.chat.send<
        { user: IUserInfo; target: IUserInfo; message: IChannelMessage },
        ICreateMessage
      >('direct.message.create', {
        user_id: parseInt(id),
        intraname: data.intraname,
        text: data.text,
        game_id: data.game_id,
      }),
    );

    // emit message to room
    this.server
      .to(`u-${user.id}`)
      .to(`u-${target.id}`)
      .emit('direct.message.create', {
        channel_id: target.intraname,
        ...message,
      });
    this.server.to(`u-${target.id}`).emit('direct.message.create', {
      channel_id: user.intraname,
      ...message,
    });
  }

  async handleConnection(client: Socket) {
    client.handshake.auth.token = this.getUserId(client);
    if (client.handshake.auth.token === -1) {
      client.disconnect();
      return;
    }
    const id = client.handshake.auth?.token;
    const query = client.handshake.query;

    // client.leave(client.id);
    client.join(`u-${id}`);
    this.logger.log(`connected: ${client.id} auth: ${id}`);
    // if true, on join user will receive an event for each channel
    try {
      const { user, channels, friends } = await firstValueFrom(
        this.chat.send<
          {
            user: IUserInfo;
            channels: IUserChannelData[];
            friends: IDirect[];
          },
          { user_id: number }
        >('room.auto.join', {
          user_id: parseInt(id),
        }),
      );
      const status = user.status;
      if (user.status === UserState.OFFLINE) {
        await this.userService.updateUser({
          where: { id },
          data: { status: UserState.ONLINE },
        });
        user.status = UserState.ONLINE;
      }
      let sockets = await this.server.in(`u-${id}`).fetchSockets();
      if (channels) {
        channels.forEach((elem) => {
          if (status === UserState.OFFLINE && sockets.length <= 1) {
            const muted = getMuteState(elem?.ChannelMute[0]);
            client.to(elem.channel.id).emit('channel.room.join', {
              channel_id: elem.channel.id,
              user: { user, role: elem.role, muted },
            });
          }
          client.emit('channel.room.join.ack', {
            ...elem.channel,
            ChannelMute: undefined,
            user_role: elem.role,
            // user_role: elem.role,
          });
          client.join(elem.channel.id);
        });
      }
      if (friends) {
        friends.forEach((elem) => {
          if (status === UserState.OFFLINE && sockets.length <= 1) {
            client
              .to(`u-${elem.friend.id}`)
              .emit('direct.room.join', user.intraname);
          }
          client.emit('direct.room.join.ack', elem);
        });
      }
    } catch (e) {
      client.emit('error', e);
    }
  }

  async handleDisconnect(client: Socket) {
    const id = client.handshake.auth?.token;

    if (!id) {
      return;
    }
    // client.leave(client.id);
    const sockets = await this.server.in(`u-${id}`).fetchSockets();
    if (sockets.length === 0) {
      await this.userService.updateUser({
        where: { id },
        data: { status: UserState.OFFLINE },
      });
      await new Promise((resolve) => setTimeout(resolve, 5000)).then(
        async () => {
          const { status } = await this.userService.findById(id);
          if (status !== UserState.OFFLINE) {
            return;
          }
          try {
            const { user, channels, friends } = await firstValueFrom(
              this.chat.send<
                {
                  user: IUserInfo;
                  channels: IUserChannelData[];
                  friends: IDirect[];
                },
                { user_id: number }
              >('room.auto.leave', {
                user_id: parseInt(id),
              }),
            );
            if (channels) {
              channels.forEach((elem) => {
                client.to(elem.channel.id).emit('channel.room.leave', {
                  channel_id: elem.channel.id,
                  user: { user, role: elem.role },
                });
              });
            }
            // sockets = await this.server.in(`u-${id}`).fetchSockets();
            if (friends) {
              friends.forEach((elem) => {
                client
                  .to(`u-${elem.friend.id}`)
                  .emit('direct.room.leave', user.intraname);
              });
            }
          } catch (e) {
            client.emit('error', e);
          }
          // resolve({});
        },
      );
    }
  }
}
