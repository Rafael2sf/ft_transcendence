import { UserEntity } from '../../user-client/user/entities/user.entity';
import { JwtPayload } from './jwt.payload.interface';

export interface CurrentUserData {
  data: UserEntity | null;
  payload: JwtPayload | null;
}
