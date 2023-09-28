import { ChannelType } from '@prisma/client';

export class UpdateChannelDto {
  user_id: number;
  channel_id: string;
  name?: string;
  type?: ChannelType;
  password?: string;
}
