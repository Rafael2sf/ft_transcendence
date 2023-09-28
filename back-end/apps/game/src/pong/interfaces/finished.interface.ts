export class IFinish {
  action: 'update' | 'delete';
  id: number;
  user1: IUser;
  user2: IUser;
}

export class IUser {
  id: number;
  won: boolean;
  score: number;
}
