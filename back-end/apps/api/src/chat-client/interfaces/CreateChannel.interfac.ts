import { ChannelType } from '@prisma/client';

export interface ICreateChannel {
  user_id: number;
  name: string;
  type: ChannelType;
  password?: string;
}
