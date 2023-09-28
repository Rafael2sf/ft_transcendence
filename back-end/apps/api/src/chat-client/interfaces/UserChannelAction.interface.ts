export interface IUserChannelAction {
  user_id: number;
  channel_id: string;
  target: string;
  timestamp?: number;
  permission?: string;
}
