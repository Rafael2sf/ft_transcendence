import { ChannelRole } from '@prisma/client';

export interface IGetChannel {
  channel_id: string;
  user_id: number;
  limit: number;
  offset: number;
  roles: ChannelRole[];
}
