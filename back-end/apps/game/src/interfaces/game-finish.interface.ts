export interface IGameFinish {
  ladder?: {
    user_id: number;
    new_ladder: number;
  };
  game?: {
    id: number;
    user1: {
      id: number;
      won: boolean;
      score: number;
    };
    user2: {
      id: number;
      won: boolean;
      score: number;
    };
  };
}
