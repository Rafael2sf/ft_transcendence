import { Controller, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ChannelMessage, ChannelRole } from '@prisma/client';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';

import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { GetChannelDto } from './dto/GetChannel.dto';
import { GetChannelsDto } from './dto/GetChannels.dto';
import { GetMessagesDto } from './dto/GetMessagesDto';
import { UpdateChannelDto } from './dto/UpdateChannel.dto';
import { UserChannelDto } from './dto/UserChannel.dto';
import { UserChannelActionDto } from './dto/UserChannelAction.dto';

import { Role, RolesGuard } from './guards/roles.guard';
import { LoggingInterceptor } from './interceptor/Logging.interceptor';
import {
  IChannelInfo,
  IChannelMembers,
  IChannelMessage,
  IDirect,
  IUserChannelData,
  IUserInfo,
  IUserRole,
  IUserTarget,
} from './interfaces/Chat.interfaces';
import { IRoleGuardMetadata } from './interfaces/RoleGuardMetadata';

@UseGuards(RolesGuard)
@UseInterceptors(new LoggingInterceptor())
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern('channel.get.many')
  getChannels(@Payload() data: GetChannelsDto): Promise<IChannelInfo[]> {
    return this.chatService.channelGetMany(data);
  }

  @Role(ChannelRole.USER)
  @MessagePattern('channel.get.unique')
  getChannel(
    @Payload() data: GetChannelDto & IRoleGuardMetadata,
  ): Promise<IChannelMembers> {
    return this.chatService.channelGetOne(data);
  }

  @MessagePattern('channel.create')
  channelCreate(@Payload() data: CreateChannelDto): Promise<IChannelInfo> {
    return this.chatService.channelCreateOne(data);
  }

  @Role(ChannelRole.OWNER)
  @MessagePattern('channel.update')
  channelUpdate(
    @Payload() data: UpdateChannelDto & IRoleGuardMetadata,
  ): Promise<IChannelInfo> {
    return this.chatService.channelUpdateOne(data);
  }

  @Role(ChannelRole.OWNER)
  @MessagePattern('channel.delete')
  channelDelete(
    @Payload() data: UserChannelDto & IRoleGuardMetadata,
  ): Promise<IUserInfo> {
    return this.chatService.channelDeleteOne(data);
  }

  @MessagePattern('channel.user.join')
  channelJoin(
    @Payload() data: UserChannelDto,
  ): Promise<{ user: IUserRole; channel: IChannelInfo }> {
    return this.chatService.userChannelJoinOne(data);
  }

  @Role(ChannelRole.ADMIN, true)
  @MessagePattern('channel.user.update')
  userChannelUpdate(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserRole> {
    return this.chatService.userChannelUpdateOne(data);
  }

  @Role(ChannelRole.USER)
  @MessagePattern('channel.user.leave')
  channelLeave(
    @Payload() data: UserChannelDto & IRoleGuardMetadata,
  ): Promise<IUserRole> {
    return this.chatService.userChannelLeaveOne(data);
  }

  @MessagePattern('channel.user.invite')
  channelInvite(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    return this.chatService.userChannelInviteOne(data);
  }

  @Role(ChannelRole.USER)
  @MessagePattern('channel.room.join')
  roomJoin(
    @Payload() data: UserChannelDto & IRoleGuardMetadata,
  ): Promise<{ user: IUserRole; channel: IChannelInfo }> {
    return this.chatService.roomJoinOne(data);
  }

  @MessagePattern('room.auto.join')
  async roomAutojoin(@Payload() data: { user_id: number }): Promise<{
    user: IUserInfo;
    channels: IUserChannelData[];
    friends: IDirect[];
  }> {
    return this.chatService.roomAutojoin(data);
  }

  @MessagePattern('room.auto.leave')
  async roomAutoLeave(@Payload() data: { user_id: number }): Promise<{
    user: IUserInfo;
    friends: { id: number; friend: { id: number } }[];
  }> {
    return this.chatService.roomAutoLeave(data);
  }

  @Role(ChannelRole.USER)
  @MessagePattern('channel.message.get.many')
  channelMessageGetMany(
    @Payload() data: GetMessagesDto & IRoleGuardMetadata,
  ): Promise<IChannelMessage[]> {
    return this.chatService.channelMessageGetMany(data);
  }

  @Role(ChannelRole.USER)
  @MessagePattern('channel.message.create')
  channelMessageCreate(
    @Payload() data: CreateMessageDto & IRoleGuardMetadata,
  ): Promise<IChannelMessage> {
    return this.chatService.channelMessageCreateOne(data);
  }

  @MessagePattern('direct.message.create')
  directlMessageCreate(
    @Payload() data: CreateMessageDto & IRoleGuardMetadata,
  ): Promise<{
    user: { id: number };
    target: { id: number };
    message: IChannelMessage;
  }> {
    return this.chatService.directMessageCreateOne(data);
  }

  @Role(ChannelRole.ADMIN, true)
  @MessagePattern('channel.user.mute')
  channelMute(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget & { muted?: number }> {
    return this.chatService.userChannelMuteOne(data);
  }

  @Role(ChannelRole.ADMIN, true)
  @MessagePattern('channel.user.unmute')
  channelUnmute(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    return this.chatService.userChannelUnmuteOne(data);
  }

  @Role(ChannelRole.ADMIN, true)
  @MessagePattern('channel.user.kick')
  channelKick(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    return this.chatService.userChannelKickOne(data);
  }

  @Role(ChannelRole.ADMIN, true)
  @MessagePattern('channel.user.ban')
  channelBan(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    return this.chatService.userChannelBanOne(data);
  }

  @Role(ChannelRole.ADMIN, true)
  @MessagePattern('channel.user.unban')
  channelUnban(
    @Payload() data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    return this.chatService.userChannelUnbanOne(data);
  }

  // @MessagePattern('direct.user.get.unique')
  // directUserGetUnique(
  //   @Payload() data: GetMessagesDto & IRoleGuardMetadata,
  // ): Promise<any> {
  //   return this.chatService.directUserGetUnique(data);
  // }

  @MessagePattern('direct.message.get.many')
  directMessageGetMany(
    @Payload() data: GetMessagesDto & IRoleGuardMetadata,
  ): Promise<IChannelMessage[]> {
    return this.chatService.directMessageGetMany(data);
  }
}
