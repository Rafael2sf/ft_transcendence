import {
  ChannelMute,
  ChannelRole,
  ChannelType,
  UserState,
} from '@prisma/client';

export interface IUserInfo {
  id: number;
  name: string;
  intraname: string;
  ladder: number;
  status: UserState;
  picture: string;
}

export interface IUserRole {
  user: IUserInfo;
  role: ChannelRole;
  muted?: number;
}

export interface IChannelInfo {
  id: string;
  name: string;
  type: ChannelType;
  owner: IUserInfo;
}

export interface IChannelMembers extends IChannelInfo {
  users: IUserRole[];
  members: number;
  muted: number | undefined;
  user_role: ChannelRole;
}

export interface IUserTarget {
  user: IUserRole;
  target: IUserRole;
}

export interface IChannelMessage {
  id: number;
  text: string;
  createdAt: Date;
  sender: IUserInfo;
  game_id: number | null;
}

export interface IUserChannelData {
  channel: IChannelInfo;
  role: ChannelRole;
  ChannelMute: ChannelMute[];
}

export interface IDirect {
  id: number;
  friend: IUserInfo;
}
