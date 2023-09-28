import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { createMap, mapFrom, forMember } from '@automapper/core';
import { Injectable } from '@nestjs/common';

import { CreateUserDto, UpdateUserDto, UserDto } from '../dto/user.dto';
import { LoginUserDto, SignUpUserDto } from '../../../auth/dto/auth.user.dto';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // modify entity using input data
      createMap(
        mapper,
        CreateUserDto,
        UserEntity,
        forMember(
          (dest) => dest.name,
          mapFrom((src) => src.name ?? src.intraname),
        ),
      );
      // NOTE: example of forMember transforms
      // forMember((destination) => destination.name,
      //     mapFrom((source) => source.name ?? source.intraname)),
      // forMember((dest) => dest.picture,
      //     undefinedSubstitution('default'))

      createMap(mapper, UpdateUserDto, UserEntity);

      // ???: any extra maps for deleting users?

      // return freshly created/modified user
      createMap(mapper, UserEntity, CreateUserDto);
      // createMap(mapper, UserEtity, UpdateUserDto); - validation will handle this

      // GET existing user
      createMap(mapper, UserEntity, UserDto); // TODO: what fields to expose on the frontend? (I think he said he can handle the whole entity)

      // login user (POST)
      createMap(mapper, LoginUserDto, CreateUserDto);
      // createMap(mapper, LoginUserDto, UserEntity)

      // intra 42 flow
      // createMap(mapper, Auth42Dto, UserEntity,
      //     forMember((dest) => dest.intraname,
      //         mapFrom((src) => src.name)));

      // Status to uppercase in Query
      // createMap(mapper, UserQuery, UserQuery,
      //     forMember((dest) => dest?.status,
      //         mapFrom((src) => src.status?.toUpperCase())));
      createMap(mapper, SignUpUserDto, CreateUserDto);
    };
  }
}
