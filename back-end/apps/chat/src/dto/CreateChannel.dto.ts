import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  user_id: number;
  name: string;
  type: ChannelType;
  password?: string;
}
