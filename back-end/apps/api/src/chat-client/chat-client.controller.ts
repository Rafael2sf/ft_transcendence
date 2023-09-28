import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Response } from 'express';
import { ChatClientGateway } from './chat-client.gateway';

import {
  LimitQueryPipes,
  OffsetQueryPipes,
  RoleArrayQueryPipes,
} from './pipes/pipes';

import { CreateChannelDto } from './dto/CreateChannel.dto';
import { UpdateChannelDto } from './dto/UpdateChannel.dto';
import { UpdateChannelUserDto } from './dto/UpdateChannelUser.dto';
import { ChannelRole, ChannelType, User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators';
import { IGetChannels } from './interfaces/GetChannels.interface';
import {
  IChannelInfo,
  IChannelMembers,
  IChannelMessage,
  IUserInfo,
  IUserRole,
  IUserTarget,
} from './interfaces/Chat.interfaces';
import { IGetChannel } from './interfaces/GetChannel.interface';
import { ICreateChannel } from './interfaces/CreateChannel.interfac';
import { IUpdateChannel } from './interfaces/UpdateChannel.interface';
import { IUserChannel } from './interfaces/UserChannel.interface';
import { IUserChannelAction } from './interfaces/UserChannelAction.interface';
import { IGetMessages } from './interfaces/GetMessages.interface';

@Controller()
export class ChatClientController {
  constructor(
    private readonly chatGateway: ChatClientGateway,
    @Inject('CHAT_SERVICE') private readonly chat: ClientProxy,
  ) {}

  /**
   * Channel CRUD
   * Create, update, delete and manage channels
   */

  /**
   * Returns an array of channels objects basic data,
   * with pagination querys
   *
   * @param jwt     user identifier
   * @param limit?  max number of channel elements
   * @param offset? elements to skip on select
   * @param name?   search by name
   */
  @Get('/channels/')
  async getChannels(
    @CurrentUser() user: User,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('offset', ...OffsetQueryPipes) offset: number,
    @Query('name', new DefaultValuePipe('')) name: string,
    @Res() res: Response,
  ) {
    const channels = await firstValueFrom(
      this.chat.send<IChannelInfo[], IGetChannels>('channel.get.many', {
        user_id: user.id,
        limit,
        offset,
        name,
      }),
    );
    res.json(channels);
  }

  /**
   * Returns a channel info and the users,
   * with pagination queries
   *
   * @param jwt     user identifier
   * @param limit?  max number of users elements
   * @param offset? elements to skip on select
   */
  @Get('/channels/:channel_id/')
  getChannel(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('offset', ...OffsetQueryPipes) offset: number,
    @Query('role', ...RoleArrayQueryPipes) roles: string[],
  ) {
    return this.chat.send<IChannelMembers, IGetChannel>('channel.get.unique', {
      channel_id,
      user_id: curr_user.id,
      limit,
      offset,
      roles: roles as ChannelRole[],
    });
  }

  /**
   * Create one channel
   *
   * @param jwt     user identifiers
   * @param body	channel data
   */
  @Post('/channels/')
  async createChannel(
    @CurrentUser() curr_user: User,
    @Body() body: CreateChannelDto,
    @Res() res: Response,
  ) {
    const channel = await firstValueFrom(
      this.chat.send<IChannelInfo, ICreateChannel>('channel.create', {
        user_id: curr_user.id,
        name: body.name,
        type: body.type as ChannelType,
        password: body.password,
      }),
    );

    const sockets = await this.chatGateway.server
      .in(`u-${curr_user.id}`)
      .fetchSockets();

    sockets.forEach((socket) => {
      socket.join(channel.id);
    });

    // notify room that someone has joined the channel
    this.chatGateway.server
      .to(`u-${curr_user.id}`)
      .emit('channel.room.join.ack', {
        user_role: 'OWNER',
        ...channel,
      });

    res.json(channel);
  }

  /**
   * Update one channel
   *
   * @param jwt     user identifier
   * @param body	channel data
   * @param channel_id	channel identifier
   */
  @Patch('/channels/:channel_id/')
  async updateChannel(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Body() body: UpdateChannelDto,
    @Res() res: Response,
  ) {
    // must provide at least one field
    if (!body.name && !body.type && !body.password) {
      res.status(400).json({
        statusCode: 400,
        message: 'No value provided',
        error: 'Bad Request',
      });
      return;
    }
    const channel = await firstValueFrom(
      this.chat.send<IChannelInfo, IUpdateChannel>('channel.update', {
        user_id: curr_user.id,
        channel_id,
        name: body.name,
        type: body.type as ChannelType,
        password: body.password,
      }),
    );
    // notify room of channel update
    this.chatGateway.server.to(channel_id).emit('channel.update', channel);
    res.json(channel);
  }

  /**
   * Delete one channel
   *
   * @param jwt     	user identifier
   * @param channel_id	channel identifier
   */
  @Delete('/channels/:channel_id/')
  async deleteChannel(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Res() res: Response,
  ) {
    // delete the channel from database
    const user = await firstValueFrom(
      this.chat.send<IUserInfo, IUserChannel>('channel.delete', {
        user_id: curr_user.id,
        channel_id,
      }),
    );
    // notify room that channel has been deleted
    this.chatGateway.server.to(channel_id).emit('channel.delete', {
      channel_id,
      user,
    });
    // destroy channel assigned room
    this.chatGateway.forceRoomDestroy(channel_id);
    res.send();
  }

  /**
   * Channels users, messages
   * Manage user relations to channels,
   * and creating messages
   */

  /**
   * Return messages from channel,
   * with pagination queries
   *
   * @param jwt     	user identifier
   * @param channel_id	channel identifier
   * @param limit?  	max number of users elements
   * @param offset? 	elements to skip on select
   */
  @Get('/channels/:channel_id/history')
  getChannelMessages(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('offset', ...OffsetQueryPipes) offset: number,
  ) {
    return this.chat.send<IChannelMessage[], IGetMessages>(
      'channel.message.get.many',
      {
        user_id: curr_user.id,
        channel_id,
        limit,
        offset,
      },
    );
  }

  /**
   * User joins channel
   *
   * @param jwt     	user identifier
   * @param channel_id	channel identifier
   * @param body optional password field
   */
  @Post('/channels/:channel_id/join')
  async joinChannel(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Body() body: { password: string },
    @Res() res: Response,
  ) {
    const { user, channel } = await firstValueFrom(
      this.chat.send<{ user: IUserRole; channel: IChannelInfo }, IUserChannel>(
        'channel.user.join',
        {
          user_id: curr_user.id,
          channel_id,
          password: body.password ?? undefined,
        },
      ),
    );

    // notify room that someone has joined the channel
    this.chatGateway.server
      .to(`u-${user.user.id}`)
      .emit('channel.room.join.ack', {
        user_role: user.role,
        ...channel,
      });

    this.chatGateway.server
      .to(channel_id)
      .except(`u-${user.user.id}`)
      .emit('channel.user.join', {
        channel_id,
        user,
      });

    const sockets = await this.chatGateway.server
      .in(`u-${user.user.id}`)
      .fetchSockets();

    // this.chatGateway.server.to(channel.id).emit('channel.room.join.ack', {...channel. test: '123'});
    sockets.forEach((socket) => {
      socket.join(channel.id);
    });
    res.send();
  }

  /**
   * Update user of channel
   *
   * @param jwt     	user identifier
   * @param channel_id	channel identifier
   */
  @Patch('/channels/:channel_id/:username')
  async updateChannelUser(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Body() body: UpdateChannelUserDto,
    @Res() res: Response,
  ) {
    const { user, role, muted } = await firstValueFrom(
      this.chat.send<IUserRole, IUserChannelAction>('channel.user.update', {
        user_id: curr_user.id,
        channel_id,
        target: username,
        permission: body.permission,
      }),
    );
    // notify room that channel user got modified
    this.chatGateway.server.to(channel_id).emit('channel.user.update', {
      channel_id,
      user: { user, role, muted },
    });

    res.send();
  }

  /**
   * User leaves channel
   *
   * @param jwt     	user identifier
   * @param channel_id	channel identifier
   */
  @Delete('/channels/:channel_id/join')
  async leaveChannel(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Res() res: Response,
  ) {
    const { user, role } = await firstValueFrom(
      this.chat.send<IUserRole, IUserChannel>('channel.user.leave', {
        user_id: curr_user.id,
        channel_id,
      }),
    );
    if (role === ChannelRole.OWNER)
      // delete channel room
      this.chatGateway.forceRoomDestroy(channel_id);
    // remove user from websocket room
    else this.chatGateway.forceRoomLeave(curr_user.id, channel_id);
    // notify room that someone has left the channel
    this.chatGateway.server.to(channel_id).emit('channel.user.leave', {
      channel_id,
      user: {
        user,
        role,
      },
    });
    res.send();
  }

  /**
   * User invites user to channel
   * @param jwt         user identifier
   * @param channel_id  channel_identifier
   * @param username    target user identifier
   */
  @Post('/channels/:channel_id/invite/:username')
  async inviteUserToChannel(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    const { target } = await firstValueFrom(
      this.chat.send<IUserTarget, IUserChannelAction>('channel.user.invite', {
        user_id: curr_user.id,
        channel_id,
        target: username,
      }),
    );
    // notify users of someone else joining
    this.chatGateway.server
      .to(channel_id)
      .emit('channel.user.join', { user: target, channel_id });
    // notify invited user of new channel
    this.chatGateway.server
      .to(`u-${target.user.id}`)
      .emit('channel.invite', { channel_id });
    res.send();
  }

  /**
   * Channel Actions
   *  User targets another user with an action
   * - [ban, unban, mute, unmute, kick]
   */

  /**
   * Admin mutes a basic user
   *
   * @param jwt         user identifier
   * @param channel_id  channel_identifier
   * @param username    target user identifier
   * @param timestamp   the lenght of the mute in minutes
   */
  @Post('/channels/:channel_id/mute/:username')
  async muteUser(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Query('minutes', ParseIntPipe) timestamp: number,
    @Res() res: Response,
  ) {
    const { user, target } = await firstValueFrom(
      this.chat.send<IUserTarget & { muted?: number }, IUserChannelAction>(
        'channel.user.mute',
        {
          user_id: curr_user.id,
          channel_id,
          target: username,
          timestamp,
        },
      ),
    );
    // notify room that somene got muted
    this.chatGateway.server.to(channel_id).emit('channel.user.mute', {
      user,
      target,
      channel_id,
      seconds: timestamp * 60,
    });
    res.send();
  }

  /**
   * Admin unmutes a basic user
   *
   * @param jwt         user identifier
   * @param channel_id  channel_identifier
   * @param username    target user identifier
   */
  @Delete('/channels/:channel_id/mute/:username')
  async unmuteUser(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    const { user, target } = await firstValueFrom(
      this.chat.send<IUserTarget, IUserChannelAction>('channel.user.unmute', {
        user_id: curr_user.id,
        channel_id,
        target: username,
      }),
    );
    // notify room that somene got unmuted
    this.chatGateway.server.to(channel_id).emit('channel.user.unmute', {
      user,
      target,
      channel_id,
    });
    res.send();
  }

  /**
   * Admin kicks a basic user
   *
   * @param jwt         user identifier
   * @param channel_id  channel_identifier
   * @param username    target user identifier
   */
  @Post('/channels/:channel_id/kick/:username')
  async kickUser(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    const { user, target } = await firstValueFrom(
      this.chat.send<IUserTarget, IUserChannelAction>('channel.user.kick', {
        user_id: curr_user.id,
        channel_id,
        target: username,
      }),
    );
    // notify room that user has been kicked
    this.chatGateway.server.to(channel_id).emit('channel.user.kick', {
      user,
      target,
      channel_id,
    });
    // force removable of kicked user sockets from room
    this.chatGateway.forceRoomLeave(target.user.id, channel_id);
    res.send();
  }

  /**
   * Admin bans a basic user
   *
   * @param jwt         user identifier
   * @param channel_id  channel_identifier
   * @param username    target user identifier
   */
  @Post('/channels/:channel_id/ban/:username')
  async banUser(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    const { user, target } = await firstValueFrom(
      this.chat.send<IUserTarget, IUserChannelAction>('channel.user.ban', {
        user_id: curr_user.id,
        channel_id,
        target: username,
      }),
    );
    // notify room that user has been banned
    this.chatGateway.server.to(channel_id).emit('channel.user.ban', {
      user,
      target,
      channel_id,
    });
    // force removable of banned user sockets from room
    this.chatGateway.forceRoomLeave(target.user.id, channel_id);
    res.send();
  }

  /**
   * Admin unbans a basic user
   *
   * @param jwt         user identifier
   * @param channel_id  channel_identifier
   * @param username    target user identifier
   */
  @Delete('/channels/:channel_id/ban/:username')
  async unbanUser(
    @CurrentUser() curr_user: User,
    @Param('channel_id', ParseUUIDPipe) channel_id: string,
    @Param('username') username: string,
    @Res() res: Response,
  ) {
    const { user, target } = await firstValueFrom(
      this.chat.send<IUserTarget, IUserChannelAction>('channel.user.unban', {
        user_id: curr_user.id,
        channel_id,
        target: username,
      }),
    );
    // notify room that user has been unbanned
    this.chatGateway.server.to(channel_id).emit('channel.user.unban', {
      user,
      target,
      channel_id,
    });
    res.send();
  }

  /* Direct messages */

  // @Get('/direct/:name/')
  // async getDirectUser(
  //   @CurrentUser() curr_user: User,
  //   @Param('name', new DefaultValuePipe('')) name: string,
  // ) {
  //   return await firstValueFrom(
  //     this.chat.send('direct.user.get.unique', {
  //       user_id: curr_user.id,
  //       target: name,
  //     }),
  //   );
  // }

  /**
   * Returns an array of channels objects basic data,
   * with pagination querys
   *
   * @param jwt     user identifier
   * @param limit?  max number of channel elements
   * @param offset? elements to skip on select
   * @param name?   search by name
   */
  @Get('/direct/:name/history')
  async getDirectMessages(
    @CurrentUser() curr_user: User,
    @Param('name', new DefaultValuePipe('')) name: string,
    @Query('limit', ...LimitQueryPipes) limit: number,
    @Query('offset', ...OffsetQueryPipes) offset: number,
    @Res() res: Response,
  ) {
    const channels = await firstValueFrom(
      this.chat.send<IChannelMessage[], IGetMessages>(
        'direct.message.get.many',
        {
          user_id: curr_user.id,
          limit,
          offset,
          target: name,
        },
      ),
    );
    res.json(channels);
  }
}
