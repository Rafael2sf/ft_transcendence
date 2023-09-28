import { Channel, ChannelMute, User, UserChannel } from '@prisma/client';

export interface IRoleGuardMetadata {
  _roleGuardData: {
    channel_ref: Channel & { owner: User } & {
      _count: { UserChannel: number };
    };
    user_ref: UserChannel & { user: User } & {
      ChannelMute: ChannelMute[];
    };
    target_ref?: UserChannel & { user: User } & {
      ChannelMute: ChannelMute[];
    };
  };
}
