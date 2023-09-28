export interface ICreateMessage {
  user_id: number;
  channel_id?: string;
  intraname?: string;
  text: string;
  game_id?: number;
}
