import { ChannelType } from '@prisma/client';

export interface IUpdateChannel {
  user_id: number;
  channel_id: string;
  name?: string;
  type?: ChannelType;
  password?: string;
}
