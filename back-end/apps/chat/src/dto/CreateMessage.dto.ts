export class CreateMessageDto {
  user_id: number;
  channel_id?: string;
  intraname?: string;
  text: string;
  game_id?: number;
}
