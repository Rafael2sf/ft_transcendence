interface Game {
  id: number;
  player_1: IUser;
  player_2: IUser;
  score_1: number;
  score_2: number;
  start_time: Date;
  end_time: Date;
}

interface Trophy {
  id: number;
  title: string;
  description: string;
  badge: string;
}

export interface IUser {
  id: number;
  intraname: string;
  name: string;
  picture: string;
  ladder: number;
  status: 'ONLINE' | 'IN_GAME' | 'OFFLINE';
}

export interface IAchievement {
  id: number;
  title: string;
  description: string;
  kind: string;
  image: string;
  achievements_users: IAchievementUser[];
}

export interface IAchievementUser {
  id: number;
  user_id: number;
  achievement_id: number;
  created_at: string;
  updated_at: string;
}

export interface IRequestsObject {
  sent: IUser[];
  received: IUser[];
}
