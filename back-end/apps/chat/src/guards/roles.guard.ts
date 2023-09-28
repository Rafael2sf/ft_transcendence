import { SetMetadata } from '@nestjs/common';
import { ChannelMute, ChannelRole, User, UserChannel } from '@prisma/client';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../utils/prisma.service';
import { RpcError } from '../utils/errors';
import { PrismaSelect } from '../utils/PrismaSelect';

const ROLES_KEY = 'roles';

export const Role = (role: ChannelRole, allowHierarchy = false) =>
  SetMetadata(ROLES_KEY, { role, allowHierarchy });

/**
 * When using the role guard, if the user is not in the channel
 * or the user role is less then the role specified in the metadata,
 * return an error.
 *
 * When allowHierarchy is set to true, the data returned will
 * contain the target user of a channel action, if the target user
 * role is higer or equal to the current user role, an error is returned
 *
 * If the user is banned from the channel and allowHierarchy is set to false,
 * an error will be returned
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<{
      role: ChannelRole;
      allowHierarchy: boolean;
    }>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    const req = context.switchToRpc().getData();

    if (!metadata || !req.user_id || !req.channel_id) {
      return true;
    }

    // load data from database
    const condition = !metadata.allowHierarchy
      ? {
          AND: [
            { role: { not: ChannelRole.BANNED } },
            { user_id: req.user_id },
          ],
        }
      : {
          OR: [
            {
              AND: [
                { role: { not: ChannelRole.BANNED } },
                { user_id: req.user_id },
              ],
            },
            { user: { intraname: req.target } },
          ],
        };

    const data = await this.prismaService.channel.findFirstOrThrow({
      where: { id: req.channel_id },
      include: {
        owner: { select: PrismaSelect.User },
        UserChannel: {
          where: condition,
          include: { user: true, ChannelMute: true },
        },
      },
    });

    // get user and target
    let user: UserChannel & { user: User } & { ChannelMute: ChannelMute[] } =
      undefined;
    let target: UserChannel & { user: User } & { ChannelMute: ChannelMute[] } =
      undefined;
    if (!metadata.allowHierarchy) {
      user = data.UserChannel.length ? data.UserChannel[0] : undefined;
      target = undefined;
    } else {
      user = data.UserChannel.find((elem) => elem.user.id === req.user_id);
      target = data.UserChannel.find(
        (elem) => elem.user.intraname === req.target,
      );
      if (!target || target.role === ChannelRole.NONE)
        RpcError(403, 'Cannot target this user');
    }
    // if user is not in channel return an error
    if (
      !user ||
      Object.keys(ChannelRole).indexOf(user.role) <
        Object.keys(ChannelRole).indexOf(ChannelRole.USER)
    ) {
      RpcError(403, 'Unrelated channel');
    }

    // If user role is lower then required return an error
    if (
      Object.keys(ChannelRole).indexOf(user.role) <
      Object.keys(ChannelRole).indexOf(metadata.role)
    ) {
      RpcError(403, 'Channel role insufficient');
    }

    // If user action targets an user that is higher return an error
    if (
      target &&
      Object.keys(ChannelRole).indexOf(user.role) <=
        Object.keys(ChannelRole).indexOf(target.role)
    ) {
      RpcError(403, 'Cannot target this user');
    }

    data.UserChannel = undefined;
    req._roleGuardData = {
      channel_ref: data,
      user_ref: user,
      target_ref: target,
    };
    return true;
  }
}
