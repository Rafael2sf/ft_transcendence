export interface IGetMessages {
  user_id: number;
  channel_id?: string;
  target?: string;
  limit: number;
  offset: number;
}
