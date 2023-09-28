import { AutoMap } from '@automapper/classes';
import { User, UserState } from '@prisma/client';

// TODO: base entities

declare type Optional<T> = T | undefined;

// User is merely a prisma's type.
// database 'entity' accessible to JS should be exported as a class
export class UserEntity implements User {
  @AutoMap() id: number;
  @AutoMap() intraname: string;
  @AutoMap() name: string; // TODO: name is intraname
  @AutoMap() picture: Optional<string>;
  @AutoMap() status: Optional<UserState>;
  @AutoMap() ladder: Optional<number>;
  @AutoMap() is_two_factor_enabled: boolean;
  @AutoMap() two_factor_secret: Optional<string>;
}
