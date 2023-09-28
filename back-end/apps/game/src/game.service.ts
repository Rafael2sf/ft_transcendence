import { Injectable } from '@nestjs/common';
import { Pong } from './pong/pong';
import { WsUser } from './entities/ws-user.entity';
import { PongOpts } from './pong/game-objects/options';
import { IPong } from './pong/interfaces/pong.interface';

@Injectable()
export class GameService {
  private users: WsUser[] = [];
  private sessions: Pong[] = [];

  userGetUnique(id: number | string) {
    if (typeof id === 'string') {
      return this.users.find((user) => user.id == id);
    }
    return this.users.find((user) => user.user_id == id);
  }

  sessionGetUnique(id: number): Pong {
    const session = this.sessions.find((session) => session.id == id);
    return session;
  }

  userAdd(user: WsUser): WsUser {
    this.users = this.users.filter((u) => u.user_id !== user.user_id);
    this.users.push(user);
    return user;
  }

  userRemove(id: string): void {
    this.users = this.users.filter((user) => user.id !== id);
  }

  userMatches(id: string, user_id: number): boolean {
    const user = this.userGetUnique(id);
    return user.user_id === user_id;
  }

  sessionFindOrCreate(id: number, opts: Partial<PongOpts>) {
    const s = this.sessionGetUnique(id);
    if (s) return s;
    const session = new Pong(id, opts);
    this.sessions.push(session);
    return session;
  }

  sessionGetSpecs(id: number): WsUser[] {
    return this.users.filter(
      (user) => user.game_id === id && user.role === 'spectator',
    );
  }

  sessionUpdate(id: number, dt: number): IPong {
    const session = this.sessionGetUnique(id);
    if (!session) return;
    session.update(dt);
    return session.render();
  }
}
