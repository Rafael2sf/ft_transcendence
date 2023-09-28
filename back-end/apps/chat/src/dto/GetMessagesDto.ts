export class GetMessagesDto {
  user_id: number;
  channel_id?: string;
  target?: string;
  limit: number;
  offset: number;
}
