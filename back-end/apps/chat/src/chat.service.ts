import { Injectable } from '@nestjs/common';
import {
  ChannelRole,
  ChannelType,
  ChannelMute,
  DirectState,
  UserState,
} from '@prisma/client';
import { PrismaService } from './utils/prisma.service';
import { compare, genSalt, hash } from 'bcrypt';
import { RpcError } from './utils/errors';

import { CreateChannelDto } from './dto/CreateChannel.dto';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { GetMessagesDto } from './dto/GetMessagesDto';
import { UpdateChannelDto } from './dto/UpdateChannel.dto';
import { UserChannelDto } from './dto/UserChannel.dto';
import { UserChannelActionDto } from './dto/UserChannelAction.dto';
import { IRoleGuardMetadata } from './interfaces/RoleGuardMetadata';
import { GetChannelDto } from './dto/GetChannel.dto';

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
import { PrismaSelect } from './utils/PrismaSelect';
import { GetChannelsDto } from './dto/GetChannels.dto';
import { GENERAL_CHANNEL_ID, SERVER_USER_ID } from './utils/constants';

function getMuteState(mute?: ChannelMute): number | undefined {
  const mute_end = mute
    ? new Date(mute.createdAt).getTime() + mute.seconds * 1000
    : undefined;
  return mute_end && mute_end > Date.now() ? mute_end : undefined;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  channelGetMany(data: GetChannelsDto): Promise<IChannelInfo[]> {
    const { name, limit, offset } = data;
    const condition = [];
    if (data.name?.length > 0) condition.push({ name: { contains: name } });

    return this.prisma.channel.findMany({
      where: {
        AND: [
          ...condition,
          {
            UserChannel: {
              none: {
                AND: [
                  {
                    user_id: data.user_id,
                    role: { not: ChannelRole.NONE },
                  },
                ],
              },
            },
          },
          { type: { not: ChannelType.PRIVATE } },
        ],
      },
      take: limit,
      skip: offset,
      select: PrismaSelect.ChannelAndOwner,
    });
  }

  async channelGetOne(
    data: GetChannelDto & IRoleGuardMetadata,
  ): Promise<IChannelMembers> {
    const { user_ref, channel_ref } = data._roleGuardData;
    const [users, members] = await this.prisma.$transaction([
      this.prisma.userChannel.findMany({
        where: {
          channel_id: channel_ref.id,
          role: { in: data.roles },
        },
        select: {
          role: true,
          user: { select: PrismaSelect.User },
          ChannelMute: true,
        },
        orderBy: { role: 'desc' },
        skip: data.offset,
        take: data.limit,
      }),
      this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int FROM "UserChannel" WHERE "channel_id"::text = $1 AND "role"::text NOT IN ('BANNED', 'NONE')`,
        channel_ref.id,
      ),
    ]);

    users.forEach((elem: any) => {
      elem.muted = getMuteState(elem.ChannelMute[0]);
      elem.ChannelMute = undefined;
    });
    delete channel_ref.owner_id;
    delete channel_ref.password;
    return {
      ...channel_ref,
      users,
      members: members[0].count,
      muted: getMuteState(user_ref.ChannelMute[0]),
      user_role: user_ref.role,
    };
  }

  async channelCreateOne(data: CreateChannelDto): Promise<IChannelInfo> {
    if (data.type === ChannelType.PROTECTED && !data.password)
      RpcError(401, 'Must provide a password');
    // if (data.type !== ChannelType.PROTECTED && data.password)
    //   RpcError(400, 'Provided password field for non protected channel');
    if (data.type === ChannelType.PROTECTED && data.password)
      data.password = await hash(data.password, await genSalt(8));
    return this.prisma.channel.create({
      data: {
        name: data.name,
        type: data.type,
        owner: { connect: { id: data.user_id } },
        password: data.password ?? null,
        UserChannel: {
          create: { user_id: data.user_id, role: ChannelRole.OWNER },
        },
      },
      select: PrismaSelect.ChannelAndOwner,
    });
  }

  async channelUpdateOne(
    data: UpdateChannelDto & IRoleGuardMetadata,
  ): Promise<IChannelInfo> {
    const { channel_ref } = data._roleGuardData;
    const is_password_equal =
      data.password &&
      channel_ref.password &&
      (await compare(data.password, channel_ref.password));
    if (data.type === ChannelType.PROTECTED) {
      if (!data.password) RpcError(400, 'Missing password field');
      else data.password = await hash(data.password, await genSalt(8));
    }
    if (
      data.name === channel_ref.name &&
      data.type === channel_ref.type &&
      (data.type !== ChannelType.PROTECTED || is_password_equal)
    ) {
      RpcError(400, 'Nothing to be updated');
    }
    const [channel, _] = await this.prisma.$transaction([
      this.prisma.channel.update({
        where: {
          id: channel_ref.id,
        },
        data: {
          name: data.name ?? channel_ref.name,
          type: data.type ?? channel_ref.type,
          password:
            data.password && data.type === ChannelType.PROTECTED
              ? data.password
              : null,
        },
        select: PrismaSelect.ChannelAndOwner,
      }),
      this.prisma.channelMessage.create({
        data: {
          user: { connect: { id: SERVER_USER_ID } },
          channel: { connect: { id: channel_ref.id } },
          text: `Channel settings updated`,
        },
      }),
    ]);
    return channel;
  }

  async channelDeleteOne(
    data: UserChannelDto & IRoleGuardMetadata,
  ): Promise<IUserInfo> {
    const { user_ref, channel_ref } = data._roleGuardData;
    await this.prisma.channel.delete({
      where: {
        id: data._roleGuardData.channel_ref.id,
      },
    });
    delete channel_ref.password;
    delete channel_ref._count;
    delete channel_ref.owner_id;
    return { ...user_ref.user };
  }

  async userChannelJoinOne(
    data: UserChannelDto,
  ): Promise<{ user: IUserRole; channel: IChannelInfo }> {
    const channel = await this.prisma.channel.findUniqueOrThrow({
      where: {
        id: data.channel_id,
      },
      include: {
        owner: true,
        UserChannel: {
          where: {
            user_id: data.user_id,
          },
        },
      },
    });
    if (channel.type === ChannelType.PRIVATE)
      RpcError(403, 'Channel is private');
    if (
      channel.UserChannel.length !== 0 &&
      Object.keys(ChannelRole).indexOf(channel.UserChannel[0].role) >=
        Object.keys(ChannelRole).indexOf(ChannelRole.USER)
    ) {
      RpcError(409, 'User already belongs to the channel');
    }
    if (
      channel.UserChannel.length !== 0 &&
      channel.UserChannel[0].role === ChannelRole.BANNED
    ) {
      RpcError(403, 'Banned from this channel');
    }
    if (channel.type === ChannelType.PROTECTED) {
      if (!(await compare(data.password, channel.password))) {
        RpcError(403, 'Invalid password');
      }
    }
    const user =
      channel.UserChannel.length === 0
        ? await this.prisma.userChannel.create({
            data: {
              channel: { connect: { id: data.channel_id } },
              user: { connect: { id: data.user_id } },
              role: ChannelRole.USER,
            },
            select: { role: true, user: { select: PrismaSelect.User } },
          })
        : await this.prisma.userChannel.update({
            where: {
              id: channel.UserChannel[0].id,
            },
            data: {
              role: ChannelRole.USER,
            },
            select: { role: true, user: { select: PrismaSelect.User } },
          });
    await this.prisma.channelMessage.create({
      data: {
        user: { connect: { id: SERVER_USER_ID } },
        channel: { connect: { id: channel.id } },
        text: `${user.user.name} @${user.user.intraname} joined`,
      },
    });
    delete channel.UserChannel;
    delete channel.owner_id;
    delete channel.password;
    return { user, channel };
  }

  async userChannelUpdateOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserRole> {
    const { user_ref, target_ref, channel_ref } = data._roleGuardData;
    if (target_ref.role === ChannelRole.BANNED)
      RpcError(403, 'Cannot target this user');
    if (
      Object.keys(ChannelRole).indexOf(user_ref.role) <=
      Object.keys(ChannelRole).indexOf(data.permission)
    ) {
      // allow promoting to self role only when owner
      if (
        user_ref.role !== ChannelRole.OWNER ||
        data.permission !== ChannelRole.OWNER
      )
        RpcError(403, 'Channel role insufficient');
    }
    if (target_ref.role === data.permission) {
      RpcError(409, 'User already has this role');
    }
    const new_role: ChannelRole = data.permission as ChannelRole;
    let updatedUser: any = {};
    // update user isntance
    if (data.permission === 'OWNER') {
      const querys = await this.prisma.$transaction([
        this.prisma.channel.update({
          where: { id: channel_ref.id },
          data: { owner: { connect: { id: target_ref.user.id } } },
        }),
        this.prisma.userChannel.update({
          where: { id: target_ref.id },
          data: { role: ChannelRole.OWNER },
          select: { user: { select: PrismaSelect.User }, ChannelMute: true },
        }),
        this.prisma.userChannel.update({
          where: { id: user_ref.id },
          data: { role: ChannelRole.USER },
        }),
      ]);
      updatedUser = querys[1];
    } else {
      updatedUser = await this.prisma.userChannel.update({
        where: { id: target_ref.id },
        data: { role: new_role },
        select: { user: { select: PrismaSelect.User }, ChannelMute: true },
      });
    }
    await this.prisma.channelMessage.create({
      data: {
        user: { connect: { id: SERVER_USER_ID } },
        channel: { connect: { id: data.channel_id } },
        text: `${target_ref.user.name} @${target_ref.user.intraname} \
          role has been changed to ${new_role}`,
      },
    });
    const muted =
      updatedUser.ChannelMute.length > 0
        ? getMuteState(updatedUser.ChannelMute[0])
        : undefined;
    updatedUser.ChannelMute = undefined;
    return { user: updatedUser.user, muted, role: new_role };
  }

  async userChannelLeaveOne(
    data: UserChannelDto & IRoleGuardMetadata,
  ): Promise<IUserRole> {
    const { channel_ref, user_ref } = data._roleGuardData;
    if (channel_ref.id === GENERAL_CHANNEL_ID)
      RpcError(403, 'You cannot leave this channel');
    if (user_ref.role === ChannelRole.OWNER) {
      await this.prisma.channel.delete({
        where: {
          id: channel_ref.id,
        },
      });
    } else {
      await this.prisma.userChannel.update({
        where: {
          id: user_ref.id,
        },
        data: {
          role: ChannelRole.NONE,
        },
      });
    }
    if (user_ref.role !== ChannelRole.OWNER) {
      await this.prisma.channelMessage.create({
        data: {
          user: { connect: { id: SERVER_USER_ID } },
          channel: { connect: { id: data.channel_id } },
          text: `${user_ref.user.name} @${user_ref.user.intraname} left.`,
        },
      });
    }
    return { user: user_ref.user, role: user_ref.role };
  }

  async userChannelInviteOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    const users = await this.prisma.direct.findFirstOrThrow({
      where: {
        user_id: data.user_id,
        target: { intraname: data.target },
      },
      include: {
        user: {
          include: {
            UserChannel: {
              where: {
                channel_id: data.channel_id,
              },
            },
          },
        },
        target: {
          include: {
            UserChannel: {
              where: {
                channel_id: data.channel_id,
              },
            },
          },
        },
      },
    });

    const user = users.user;
    const target = users.target;

    // invalid user or target
    if (!user || !target) {
      RpcError(403, 'No such user/target');
    }
    // inviting user does not belong to channel
    if (
      !user.UserChannel.length ||
      Object.keys(ChannelRole).indexOf(user.UserChannel[0].role) <
        Object.keys(ChannelRole).indexOf(ChannelRole.USER)
    ) {
      RpcError(403, 'Unrelated channel');
    }
    // target user is already in channel
    if (
      target.UserChannel.length &&
      Object.keys(ChannelRole).indexOf(target.UserChannel[0].role) >=
        Object.keys(ChannelRole).indexOf(ChannelRole.USER)
    ) {
      RpcError(409, 'User already belongs to the channel');
    }
    // target user is banned
    if (
      target.UserChannel.length &&
      target.UserChannel[0].role === ChannelRole.BANNED
    ) {
      RpcError(403, 'Cannot target this user');
    }
    // add user to channel
    await this.prisma.$transaction([
      target.UserChannel.length
        ? this.prisma.userChannel.update({
            where: { id: target.UserChannel[0].id },
            data: {
              role: ChannelRole.USER,
            },
          })
        : this.prisma.userChannel.create({
            data: {
              channel: { connect: { id: data.channel_id } },
              user: { connect: { id: target.id } },
              role: ChannelRole.USER,
            },
          }),
      this.prisma.channelMessage.create({
        data: {
          user: { connect: { id: SERVER_USER_ID } },
          channel: { connect: { id: data.channel_id } },
          text: `${target.name} @${target.intraname} joined`,
        },
      }),
    ]);
    const user_channel = user.UserChannel[0];
    user.UserChannel = undefined;
    delete target.UserChannel;
    return {
      user: { user: user, role: user_channel.role },
      target: { user: target, role: ChannelRole.USER },
    };
  }

  // Rooms

  async roomJoinOne(
    data: UserChannelDto & IRoleGuardMetadata,
  ): Promise<{ user: IUserRole } & { channel: IChannelInfo }> {
    const { user_ref, channel_ref } = data._roleGuardData;
    const { role, ChannelMute } = user_ref;
    delete user_ref.role;
    delete user_ref.ChannelMute;
    delete channel_ref.password;
    return {
      channel: channel_ref,
      user: {
        user: user_ref.user,
        role,
        muted:
          ChannelMute.length > 0 ? getMuteState(ChannelMute[0]) : undefined,
      },
    };
  }

  async roomAutojoin(data: { user_id: number }): Promise<{
    user: IUserInfo;
    channels: IUserChannelData[];
    friends: IDirect[];
  }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: data.user_id,
      },
      include: {
        direct_user: {
          where: { state: DirectState.FRIEND },
          include: { target: { select: PrismaSelect.User } },
        },
        UserChannel: {
          where: {
            role: { notIn: [ChannelRole.BANNED, ChannelRole.NONE] },
          },
          select: {
            ChannelMute: true,
            role: true,
            channel: {
              select: PrismaSelect.ChannelAndOwner,
            },
          },
        },
      },
    });
    const friends: IDirect[] = [];
    user.direct_user.forEach((elem) =>
      friends.push({ id: elem.id, friend: elem.target }),
    );
    user.direct_user = undefined;
    const channels = user.UserChannel;
    user.UserChannel = undefined;
    return {
      user,
      channels,
      friends,
    };
  }

  async roomAutoLeave(data: { user_id: number }): Promise<{
    user: IUserInfo;
    channels: IUserChannelData[];
    friends: IDirect[];
  }> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: data.user_id },
      include: {
        direct_user: {
          where: { state: DirectState.FRIEND },
          include: { target: { select: PrismaSelect.User } },
        },
        UserChannel: {
          where: {
            role: { notIn: [ChannelRole.BANNED, ChannelRole.NONE] },
          },
          select: {
            ChannelMute: true,
            role: true,
            channel: {
              select: PrismaSelect.ChannelAndOwner,
            },
          },
        },
      },
    });
    const friends: IDirect[] = [];
    user.direct_user.forEach((elem) =>
      friends.push({ id: elem.id, friend: elem.target }),
    );
    user.direct_user = undefined;
    return {
      user: { ...user },
      channels: user.UserChannel,
      friends,
    };
  }

  // Messages

  async channelMessageGetMany(
    data: GetMessagesDto & IRoleGuardMetadata,
  ): Promise<IChannelMessage[]> {
    const { user_ref, channel_ref } = data._roleGuardData;

    const messages: any = await this.prisma.channelMessage.findMany({
      where: {
        channel_id: channel_ref.id,
        user: {
          direct_target: {
            none: {
              AND: [
                { user_id: user_ref.user.id },
                { state: DirectState.BLOCKED },
              ],
            },
          },
        },
      },
      select: {
        id: true,
        user: { select: PrismaSelect.User },
        text: true,
        createdAt: true,
        game_id: true,
      },
      skip: data.offset,
      take: data.limit,
      orderBy: { createdAt: 'desc' },
    });

    messages.forEach((msg: any) => {
      msg.sender = msg.user;
      msg.user = undefined;
    });

    return messages;
  }

  async channelMessageCreateOne(
    data: CreateMessageDto & IRoleGuardMetadata,
  ): Promise<IChannelMessage> {
    const { channel_ref, user_ref } = data._roleGuardData;
    if (
      user_ref.ChannelMute.length !== 0 &&
      user_ref.ChannelMute[0].createdAt.getTime() +
        user_ref.ChannelMute[0].seconds * 1000 >
        Date.now()
    )
      RpcError(403, 'User is muted');
    const game = data.game_id
      ? { game: { connect: { id: data.game_id } } }
      : {};
    const message = await this.prisma.channelMessage.create({
      data: {
        user: { connect: { id: user_ref.user.id } },
        channel: { connect: { id: channel_ref.id } },
        text: data.text,
        ...game,
      },
      include: { user: { select: PrismaSelect.User } },
    });
    const user = message.user;
    message.user = undefined;
    return {
      ...message,
      sender: user,
    };
  }

  async directMessageCreateOne(
    data: CreateMessageDto & IRoleGuardMetadata,
  ): Promise<{ user: IUserInfo; target: IUserInfo; message: IChannelMessage }> {
    const direct = await this.prisma.direct.findFirstOrThrow({
      where: {
        AND: [
          { user_id: data.user_id },
          { target: { intraname: data.intraname } },
          { state: DirectState.FRIEND },
        ],
      },
      select: { id: true },
    });
    const game = data.game_id
      ? { game: { connect: { id: data.game_id } } }
      : {};
    const message = await this.prisma.directMessage.create({
      data: {
        text: data.text,
        direct: { connect: { id: direct.id } },
        ...game,
      },
      include: {
        direct: {
          include: {
            user: { select: PrismaSelect.User },
            target: { select: PrismaSelect.User },
          },
        },
      },
    });
    const user = message.direct.user;
    const target = message.direct.target;
    delete message.direct;
    delete message.direct_id;
    return { user, target, message: { ...message, sender: user } };
  }

  async userChannelMuteOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget & { muted?: number }> {
    const { user_ref, target_ref } = data._roleGuardData;
    if (target_ref.role === ChannelRole.BANNED)
      RpcError(403, 'Cannot target this user');
    // Create or update an mute instance
    await this.prisma.channelMute.upsert({
      where: {
        user_channel_id: target_ref.id,
      },
      create: {
        user_channel_id: target_ref.id,
        seconds: data.timestamp * 60,
      },
      update: {
        createdAt: new Date(),
        seconds: data.timestamp * 60,
      },
    });
    return {
      user: { user: user_ref.user, role: user_ref.role },
      target: { user: target_ref.user, role: target_ref.role },
    };
  }

  async userChannelUnmuteOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    const { user_ref, target_ref } = data._roleGuardData;
    if (target_ref.role === ChannelRole.BANNED)
      RpcError(403, 'Cannot target this user');
    if (!target_ref.ChannelMute.length) {
      RpcError(422, 'Target user is not muted');
    }
    // Remove the mute instance if exists
    await this.prisma.channelMute.delete({
      where: { user_channel_id: target_ref.id },
    });
    return {
      user: { user: user_ref.user, role: user_ref.role },
      target: { user: target_ref.user, role: target_ref.role },
    };
  }

  async userChannelKickOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    const { user_ref, target_ref, channel_ref } = data._roleGuardData;
    if (target_ref.role === ChannelRole.BANNED)
      RpcError(403, 'Cannot target this user');
    // Remove user from channel
    await this.prisma.$transaction([
      this.prisma.userChannel.update({
        where: { id: target_ref.id },
        data: { role: ChannelRole.NONE },
      }),
      this.prisma.channelMessage.create({
        data: {
          user: { connect: { id: SERVER_USER_ID } },
          channel: { connect: { id: channel_ref.id } },
          text: `${target_ref.user.name} @${target_ref.user.intraname} has been kicked`,
        },
      }),
    ]);
    return {
      user: { user: user_ref.user, role: user_ref.role },
      target: { user: target_ref.user, role: target_ref.role },
    };
  }

  async userChannelBanOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    const { user_ref, target_ref, channel_ref } = data._roleGuardData;
    if (target_ref.role === ChannelRole.BANNED)
      RpcError(403, 'Cannot target this user');
    // Ban user from channel
    await this.prisma.$transaction([
      this.prisma.userChannel.update({
        where: { id: target_ref.id },
        data: { role: ChannelRole.BANNED },
      }),
      this.prisma.channelMessage.create({
        data: {
          user: { connect: { id: SERVER_USER_ID } },
          channel: { connect: { id: channel_ref.id } },
          text: `${target_ref.user.name} @${target_ref.user.intraname} has been banned`,
        },
      }),
    ]);
    return {
      user: { user: user_ref.user, role: user_ref.role },
      target: { user: target_ref.user, role: target_ref.role },
    };
  }

  async userChannelUnbanOne(
    data: UserChannelActionDto & IRoleGuardMetadata,
  ): Promise<IUserTarget> {
    const { user_ref, target_ref, channel_ref } = data._roleGuardData;
    if (target_ref.role !== ChannelRole.BANNED)
      RpcError(422, 'Target user is not banned');
    // Ban user from channel
    await this.prisma.$transaction([
      this.prisma.userChannel.update({
        where: { id: target_ref.id },
        data: { role: ChannelRole.NONE },
      }),
    ]);
    return {
      user: { user: user_ref.user, role: user_ref.role },
      target: { user: target_ref.user, role: target_ref.role },
    };
  }

  // async directUserGetUnique(
  //   data: GetMessagesDto & IRoleGuardMetadata,
  // ) {
  //   const users = await this.prisma.direct.findFirstOrThrow({
  //     where: {
  //       AND: [
  //         { user_id: data.user_id },
  //         { target: { intraname: data.target } },
  //         { state: DirectState.FRIEND },
  //       ],
  //     },
  //     select: { id: true, target: { select: PrismaSelect.user} },
  //   });

  //   return { id: users.id, friend: users.target };
  // }

  async directMessageGetMany(
    data: GetMessagesDto & IRoleGuardMetadata,
  ): Promise<IChannelMessage[]> {
    const users = await this.prisma.direct.findMany({
      where: {
        OR: [
          {
            AND: [
              { user_id: data.user_id },
              { target: { intraname: data.target } },
              { state: DirectState.FRIEND },
            ],
          },
          {
            AND: [
              { target_id: data.user_id },
              { user: { intraname: data.target } },
              { state: DirectState.FRIEND },
            ],
          },
        ],
      },
      include: { user: { select: PrismaSelect.User } },
    });
    if (users.length !== 2) RpcError(403, 'Unrelated users');
    const messages: any = await this.prisma.directMessage.findMany({
      where: {
        direct_id: { in: [users[0].id, users[1].id] },
      },
      skip: data.offset,
      take: data.limit,
      orderBy: { createdAt: 'desc' },
    });

    messages.forEach((msg) => {
      if (msg.direct_id === users[0].id) msg.sender = users[0].user;
      else msg.sender = users[1].user;
      delete msg.direct_id;
    });

    return messages;
  }
}
