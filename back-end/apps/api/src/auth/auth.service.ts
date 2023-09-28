import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user-client/user/user.service';
import type { User } from '@prisma/client';
import { JwtPayload } from '../common/interfaces';
import { Mapper } from '@automapper/core';
import { LoginUserDto, SignUpUserDto } from './dto';
import { InjectMapper } from '@automapper/nestjs';
import { UserEntity } from '../user-client/user/entities/user.entity';
import { Response } from 'express';
import { CreateUserDto } from '../user-client/user/dto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectMapper() private readonly _mapper: Mapper,
  ) {}

  async getUser2fa(user_id: number)
  : Promise<Partial<Pick<User, 'is_two_factor_enabled' | 'two_factor_secret'>>> {
    return await this.userService.getUser2fa(user_id);
  }

  async validate(loginUserDto: LoginUserDto): Promise<User | null> {
    if (!loginUserDto?.intraname) return null;
    return await this.userService.findByIntraname(loginUserDto.intraname);
  }

  signJwtToken(data: JwtPayload): string {
    return this.jwtService.sign(data, {
      expiresIn: '1d',
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  signJwtCookie(res: Response, jwt: string) {
    res.cookie('access_token', jwt, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
    });
  }

  async signUp(user: SignUpUserDto): Promise<User> {
    const createUser: CreateUserDto = this._mapper.map(
      user,
      SignUpUserDto,
      CreateUserDto,
    );
    const newUser: UserEntity = this._mapper.map(
      createUser,
      CreateUserDto,
      UserEntity,
    );

    return await this.userService.createUser(newUser);
  }

  // 2fa

  async generate2faApp(user: User) {
    const secret = authenticator.generateSecret();
    await this.userService.updateUser({
      where: { id: user.id },
      data: {
        two_factor_secret: authenticator.decode(secret),
      },
    });
    return await this.generate2faQRCode(user.intraname, secret);
  }

  // Turn on 2fa to the logged user, searching by their unique id
  async turnOn2faAtuh(userid: number) {
    await this.userService.updateUser({
      where: { id: userid },
      data: { is_two_factor_enabled: true },
    });
  }

  // Turn off 2fa to the logged user, searching by their unique id
  async turnOff2faAtuh(userid: number) {
    await this.userService.updateUser({
      where: { id: userid },
      data: { is_two_factor_enabled: false },
    });
  }

  // Generate and return the qr code based on the current secret;
  generate2faQRCode(username: string, secret: string) {
    const qrcode_url = authenticator.keyuri(
      username,
      'ft_transcendence',
      secret,
    );
    return toDataURL(qrcode_url);
  }

  async verify2faSecret(input: string, secret: string) {
    return authenticator.verify({
      token: input,
      secret,
    });
  }
}
