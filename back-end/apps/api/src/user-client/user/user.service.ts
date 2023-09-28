import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../utils/prisma/prisma.service';
import { User, Prisma, DirectState, Direct } from '@prisma/client';

export type UserRelation = User & { relation: Direct | null };

export interface UsersRelation {
  user1: UserRelation;
  user2: UserRelation;
}


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  
  private readonly selectUser: Prisma.UserSelect = {
    id: true,
    name: true,
    intraname: true,
    status: true,
    ladder: true,
    picture: true,
  }

  async getUser2fa(user_id: number)
  : Promise<Partial<Pick<User, 'is_two_factor_enabled' | 'two_factor_secret'>>> {
    const user = await this.prisma.user.findUnique({
      where:{
        id: user_id,
      },
      select: {
        two_factor_secret: true,
        is_two_factor_enabled: true,
      }
    })
    return user;
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: this.selectUser,
    });
    return user as User;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return (await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: this.selectUser,
    })) as User[];
  }

  async createUser(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return (await this.prisma.user.create({
      data: {
        ...data,
        UserChannel: {
          create: {
            channel: {
              connect: { id: '00000000-0000-0000-0000-000000000000' },
            },
            role: 'USER',
          },
        },
      },
      select: this.selectUser,
    })) as User;
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return (await this.prisma.user.update({
      data,
      where,
      select: this.selectUser,
    })) as User;
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return (await this.prisma.user.delete({
      where,
      select: this.selectUser,
    }) as User);
  }

  async findUnique(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User> {
    return (await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: this.selectUser,
    })) as User;
  }
  async findUniqueOrThrow(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return (await this.prisma.user.findUniqueOrThrow({
      where: userWhereUniqueInput,
      select: this.selectUser,
    }) as User);
  }
  async findOrThrow(userWhereInput: Prisma.UserWhereInput) {
    return (await this.prisma.user.findFirstOrThrow({
      where: userWhereInput,
      select: this.selectUser,
    })) as User;
  }

  async findByName(name: string): Promise<User | undefined> {
    return this.findUnique({ name: name });
  }

  async findByIntraname(intraname: string): Promise<User | undefined> {
    return this.findUnique({ intraname: intraname });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.findUnique({ id: id });
  }

  async filter(userWhereInput: Prisma.UserWhereInput): Promise<User[]> {
    return (await this.prisma.user.findMany({
      where: userWhereInput,
      select: this.selectUser,
    })) as User[];
  }

  // avatar

  async storeImage(user_id: number, intraname: string, data: Buffer) {
    // const buffer = Buffer.from(data, 'base64');
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          picture: `http://${process.env.HOST}:3000/api/user/${intraname}/avatar`,
        },
      }),
      this.prisma.image.upsert({
        where: { user_id },
        create: {
          user_id,
          data,
        },
        update: {
          user_id,
          data,
        },
      }),
    ]);
  }

  async loadImage(intraname: string): Promise<Buffer> {
    const user = await this.findByIntraname(intraname);
    const image = await this.prisma.image.findUniqueOrThrow({
      where: {
        user_id: user.id,
      },
    });
    return image.data;
  }

  // user relations
  async getUserRelation(user1_id: number, user2_name: string): Promise<UsersRelation> {
    const [user1, user2] = await this.prisma.$transaction([
      this.prisma.user.findUniqueOrThrow({ where: { id: user1_id }, select: this.selectUser }),
      this.prisma.user.findUniqueOrThrow({ where: { intraname: user2_name }, select: this.selectUser }),
    ]);
    if (user1.id === user2.id)
      throw new HttpException('Cannot target self', 409);
    const [user1_relation, user2_relation] = await this.prisma.$transaction([
      this.prisma.direct.findUnique({
        where: {
          user_id_target_id: {
            user_id: user1.id,
            target_id: user2.id,
          },
        },
      }),
      this.prisma.direct.findUnique({
        where: {
          user_id_target_id: {
            user_id: user2.id,
            target_id: user1.id,
          },
        },
      }),
    ]);
    return {
      user1: { ...user1 as User, relation: user1_relation },
      user2: { ...user2 as User, relation: user2_relation },
    };
  }

  async blockUserOne(user1_id: number, user2_name: string) {
    const data = await this.getUserRelation(user1_id, user2_name);
    // do not allow targeting bot
    if (data.user2.id === 1)
      throw new ForbiddenException('Cannot block this user');
    if (data.user1.relation?.state === DirectState.BLOCKED)
      throw new HttpException('You already blocked this user', 409);
    let querys = [
      this.prisma.direct.upsert({
        where: {
          id: data.user1.relation?.id ?? 0,
        },
        create: {
          user: { connect: { id: data.user1.id } },
          target: { connect: { id: data.user2.id } },
          state: DirectState.BLOCKED,
        },
        update: {
          state: DirectState.BLOCKED,
        },
      }),
    ];
    // if user being blocked is friend or is inviting, cancel it
    if (
      data.user2.relation &&
      ([DirectState.INVITED, DirectState.FRIEND] as DirectState[]).includes(
        data.user2.relation.state,
      )
    ) {
      querys.push(
        this.prisma.direct.update({
          where: { id: data.user2.relation.id },
          data: { state: DirectState.NONE },
        }),
      );
    }
    await this.prisma.$transaction(querys);
  }

  async unblockUserOne(user1_id: number, user2_name: string) {
    const data = await this.getUserRelation(user1_id, user2_name);
    if (
      !data.user1.relation ||
      data.user1.relation.state !== DirectState.BLOCKED
    )
      throw new HttpException('', 204);
    await this.prisma.direct.update({
      where: { id: data.user1.relation.id },
      data: { state: DirectState.NONE },
    });
  }

  async createFriendInvite(user1_id: number, user2_name: string) {
    const data = await this.getUserRelation(user1_id, user2_name);
    // do not allow targeting bot
    if (data.user2.id === 1)
      throw new ForbiddenException('Cannot invite this user');
    // reject invite if user already sent reques or is friend
    if (
      data.user1.relation &&
      ([DirectState.INVITED, DirectState.FRIEND] as DirectState[]).includes(
        data.user1.relation.state,
      )
    )
      throw new HttpException('', 204);
    // reject invite if an reversed invite is pending
    if (
      data.user2.relation &&
      data.user2.relation.state === DirectState.INVITED
    ) {
      throw new ConflictException(
        'Could not send a friend request because one already exists from this user',
      );
    }
    // reject an invite to blocked user
    if (data.user1.relation?.state === DirectState.BLOCKED)
      throw new ConflictException(
        'Could not send a friend request because you blocked this user',
      );
    // reject an invite from blocked user
    if (data.user2.relation?.state === DirectState.BLOCKED)
      throw new ConflictException(
        'Could not send a friend request because you are blocked by this user',
      );
    // create or update relation
    await this.prisma.direct.upsert({
      where: {
        id: data.user1.relation?.id ?? 0,
      },
      create: {
        user: { connect: { id: data.user1.id } },
        target: { connect: { id: data.user2.id } },
        state: DirectState.INVITED,
      },
      update: {
        state: DirectState.INVITED,
      },
    });
  }

  async deleteFriendOrInvite(
    user1_id: number,
    user2_name: string,
  ): Promise<Direct & { previousRelation: DirectState }> {
    const data = await this.getUserRelation(user1_id, user2_name);
    // remove friend relation
    if (data.user1.relation?.state === DirectState.FRIEND) {
      let querys = [
        this.prisma.direct.update({
          where: { id: data.user1.relation.id },
          data: { state: DirectState.NONE },
        }),
      ];
      if (data.user2.relation) {
        querys.push(
          this.prisma.direct.update({
            where: { id: data.user2.relation.id },
            data: { state: DirectState.NONE },
          }),
        );
      }
      const [r1, r2] = await this.prisma.$transaction(querys);
      return { ...r1, previousRelation: DirectState.FRIEND };
    } else if (data.user1.relation?.state === DirectState.INVITED) {
      const r1 = await this.prisma.direct.update({
        where: { id: data.user1.relation.id },
        data: { state: DirectState.NONE },
      });
      return { ...r1, previousRelation: DirectState.INVITED };
    }
    throw new HttpException('No friend/request found', 404);
  }

  async getUserRelatedInvites(user_id: number) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: user_id,
      },
      select: {
        direct_user: {
          where: { state: DirectState.INVITED },
          select: { target: {
            select: this.selectUser,
          } },
        },
        direct_target: {
          where: { state: DirectState.INVITED },
          select: { user: {
            select: this.selectUser,
          } },
        },
      },
    });
    let sent = [];
    user.direct_user.forEach((elem) => sent.push(elem.target));
    let received = [];
    user.direct_target.forEach((elem) => received.push(elem.user));
    return { sent, received };
  }

  async getUserRelationsByState(
    user: number | string,
    states: DirectState[],
  ): Promise<User[]> {
    const user_direct = await this.prisma.user.findUniqueOrThrow({
      where: typeof user === 'string' ? { intraname: user } : { id: user },
      select: {
        direct_user: {
          where: { state: { in: states } },
          select: { target: {
            select: this.selectUser,
          } },
        },
      },
    });
    const users: User[] = [];
    user_direct.direct_user.forEach((elem) => {
      users.push(elem.target as User);
    });
    return users;
  }

  async acceptFriendInvite(
    user1_id: number,
    user2_name: string,
  ): Promise<UsersRelation> {
    let data = await this.getUserRelation(user1_id, user2_name);
    if (
      !data.user2.relation ||
      data.user2.relation.state !== DirectState.INVITED
    )
      throw new NotFoundException('No friend invite found');
    const [r1, r2] = await this.prisma.$transaction([
      this.prisma.direct.upsert({
        where: {
          id: data.user1.relation?.id ?? 0,
        },
        create: {
          user: { connect: { id: data.user1.id } },
          target: { connect: { id: data.user2.id } },
          state: DirectState.FRIEND,
        },
        update: { state: DirectState.FRIEND },
      }),
      this.prisma.direct.update({
        where: { id: data.user2.relation.id },
        data: { state: DirectState.FRIEND },
      }),
    ]);
    data.user1.relation = r1;
    data.user2.relation = r2;
    return data;
  }

  async declineFriendInvite(user1_id: number, user2_name: string) {
    const data = await this.getUserRelation(user1_id, user2_name);
    if (
      !data.user2.relation ||
      data.user2.relation.state !== DirectState.INVITED
    )
      throw new NotFoundException('No friend invite found');
    await this.prisma.direct.update({
      where: { id: data.user2.relation.id },
      data: { state: DirectState.NONE },
    });
  }
}
