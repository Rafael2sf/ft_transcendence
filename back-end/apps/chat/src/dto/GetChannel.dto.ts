import { ChannelRole } from '@prisma/client';

export class GetChannelDto {
  channel_id: string;
  user_id: number;
  limit: number;
  offset: number;
  roles: ChannelRole[];
}
