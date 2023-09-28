import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ForbiddenException,
  UseFilters,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard, Auth42Guard } from './guards';
import { PayloadExistsPipe } from '../common/pipes/PayloadExists.pipe';
import { Request, Response } from 'express';
import { AllowUnregistered } from './decorators/AllowUneregistered.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Bypass2fa } from './decorators/Bypass2fa.decorator';
import { CurrentUserData } from '../common/interfaces/CurrentUserData.interface';
import { HttpExceptionFilter, PrismaExceptionFilter } from '../common/filters';
import { Public } from './decorators';
import { LoginUserDto, SignUpUserDto, TwoFactorCodeDto } from './dto';
import { IUserInfo } from '../chat-client/interfaces/Chat.interfaces';
import { authenticator } from 'otplib';

@UseFilters(HttpExceptionFilter, PrismaExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Res() res: Response, @CurrentUser() user: IUserInfo) {
    const twoFactorState = await this.authService.getUser2fa(user.id);
    const token = this.authService.signJwtToken({
      sub: user.id,
      intraname: user.intraname,
      registered: true,
      is_two_factor_authenticated: false,
      is_two_factor_enabled: twoFactorState.is_two_factor_enabled,
    });
    this.authService.signJwtCookie(res, token);
    res.send();
  }

  @Public()
  @UsePipes(PayloadExistsPipe)
  @HttpCode(HttpStatus.CREATED)
  @Post('/local/signup/')
  async signup2(@Body() loginUserDto: LoginUserDto) {
    await this.authService.signUp({
      id: undefined,
      intraname: loginUserDto.intraname,
      name: loginUserDto.intraname,
    });
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('/42/login')
  async login42(@Res() res: Response) {
    res.redirect(`http://${process.env.HOST}:3000/api/auth/42/callback`);
  }

  @Public()
  @UseGuards(Auth42Guard)
  @Get('/42/callback')
  async callbackIntra(@Req() req: Request, @Res() res: Response): Promise<any> {
    this.authService.signJwtCookie(res, req.user as string);
    res.redirect(`http://${process.env.HOST}:5173/register`);
  }

  @UsePipes(PayloadExistsPipe)
  @HttpCode(HttpStatus.CREATED)
  @AllowUnregistered()
  @UsePipes(ValidationPipe)
  @Post('signup')
  async signup(
    @Req() req: Request,
    @Body() body: SignUpUserDto,
    @Res() res: Response,
  ) {
    const { payload } = req['user'] as CurrentUserData;
    await this.authService.signUp({
      id: payload.sub,
      name: body.name,
      intraname: payload.intraname,
    });
    const token = this.authService.signJwtToken({
      sub: payload.sub,
      intraname: payload.intraname,
      is_two_factor_authenticated: true,
      is_two_factor_enabled: true,
      registered: true,
    });
    this.authService.signJwtCookie(res, token);
    res.send();
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res() res: Response): Promise<void> {
    res.cookie(
      'access_token',
      {},
      { httpOnly: true, maxAge: 0, sameSite: 'strict' },
    );
    res.send();
  }

  // 2fa

  @Post('/2fa/on')
  async two_factor_turn_on(
    @Body() body: TwoFactorCodeDto,
    @CurrentUser() user: IUserInfo,
    @Res() res: Response,
  ) {
    const { is_two_factor_enabled, two_factor_secret } =
      await this.authService.getUser2fa(user.id);
    const is_valid = await this.authService.verify2faSecret(
      body.code,
      authenticator.encode(two_factor_secret),
    );
    if (!is_valid) throw new ForbiddenException('Invalid code');
    if (is_two_factor_enabled) return res.status(204).send();
    await this.authService.turnOn2faAtuh(user.id);
    const token = this.authService.signJwtToken({
      sub: user.id,
      intraname: user.intraname,
      is_two_factor_authenticated: true,
      is_two_factor_enabled: true,
      registered: true,
    });
    this.authService.signJwtCookie(res, token);
    res.status(200).send();
  }

  @Post('/2fa/off')
  async two_factor_turn_off(
    @Body() body: TwoFactorCodeDto,
    @CurrentUser() user: IUserInfo,
    @Res() res: Response,
  ) {
    const { is_two_factor_enabled, two_factor_secret } =
      await this.authService.getUser2fa(user.id);
    const is_valid = await this.authService.verify2faSecret(
      body.code,
      authenticator.encode(two_factor_secret),
    );
    if (!is_valid) throw new ForbiddenException('Invalid code');
    if (!is_two_factor_enabled) return res.status(204).send();
    await this.authService.turnOff2faAtuh(user.id);
    const token = this.authService.signJwtToken({
      sub: user.id,
      intraname: user.intraname,
      is_two_factor_authenticated: false,
      is_two_factor_enabled: false,
      registered: true,
    });
    this.authService.signJwtCookie(res, token);
    res.status(200).send();
  }

  @Get('/2fa/generate')
  async generate_token(@CurrentUser() user: User, @Res() res: Response) {
    const { is_two_factor_enabled } = await this.authService.getUser2fa(
      user.id,
    );
    if (is_two_factor_enabled)
      throw new ForbiddenException('two-factor is alredy enabled');
    const qrcode = await this.authService.generate2faApp(user);
    res.status(200).send(qrcode);
  }

  @Bypass2fa()
  @Post('/2fa/validate')
  async validate_token(
    @CurrentUser() user: IUserInfo,
    @Body() body: TwoFactorCodeDto,
    @Res() res: Response,
  ) {
    const { two_factor_secret, is_two_factor_enabled } =
      await this.authService.getUser2fa(user.id);
    if (!is_two_factor_enabled) return res.status(204).send();
    const is_valid = await this.authService.verify2faSecret(
      body.code,
      authenticator.encode(two_factor_secret),
    );
    if (!is_valid) throw new ForbiddenException('Invalid code');
    const token = this.authService.signJwtToken({
      sub: user.id,
      intraname: user.intraname,
      is_two_factor_authenticated: true,
      is_two_factor_enabled: true,
      registered: true,
    });
    this.authService.signJwtCookie(res, token);
    return res.status(200).send();
  }
}
