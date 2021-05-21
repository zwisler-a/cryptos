import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { response } from 'express';

import { AuthService } from './auth.service';
import { AuthnResponse } from './dto/authn-response.dto';
import { UserToken } from './dto/user-token.dto';
import { JwtAuthGuard } from './jwt.strategy';
import { LocalAuthGuard } from './local.strategy';

@Controller('auth')
export class AuthController {
  private longTokenOpts = {
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  };
  private readonly authCookieName = 'auth';
  private readonly longCookieName = 'MFPDEUYGIQ';
  private logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  public loginUser(@Req() req, @Res() res) {
    this.logger.debug(`Logging in user ${req.user.username}.`);
    const jwtToken = this.authService.createToken(req.user);
    const longToken = this.authService.createLongToken(req.user);
    res.cookie(this.longCookieName, longToken, this.longTokenOpts);
    res.cookie(this.authCookieName, jwtToken);
    res.send({ jwtToken });
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard)
  public logout(@Req() req, @Res() res) {
    res.clearCookie(this.authCookieName);
    res.clearCookie(this.longCookieName);
    res.send({ success: true });
  }

  @Get('/id')
  @UseGuards(JwtAuthGuard)
  public id(@Req() req) {
    return req.user;
  }

  @Get('/authn/get-register-challange')
  @UseGuards(JwtAuthGuard)
  async getChallange(@Req() req) {
    const user: UserToken = req.user;
    return this.authService.getAuthnRegisterChallenge(user);
  }

  @Post('/authn/register')
  @UseGuards(JwtAuthGuard)
  async register(@Req() req, @Res() res, @Body() response: AuthnResponse) {
    const user: UserToken = req.user;
    const result = await this.authService.registerAuthnCredentials(
      response,
      user,
    );
    res.send({ result });
  }

  @Get('/authn/get-login-challange')
  async authnLogin(@Req() req, @Res() res) {
    const longTokenStr = req.cookies[this.longCookieName];
    if (!longTokenStr) throw new UnauthorizedException();
    const longToken = this.authService.varifyLongToken(longTokenStr);
    const assertion = await this.authService.getAutnLoginChallange(
      longToken.userid,
    );
    res.send(assertion);
  }

  @Post('/authn/login')
  async authnLoginResponse(
    @Req() req,
    @Res() res,
    @Body() response: AuthnResponse,
  ) {
    const longTokenStr = req.cookies[this.longCookieName];
    if (!longTokenStr) throw new UnauthorizedException();
    const longToken = this.authService.varifyLongToken(longTokenStr);
    const result = await this.authService.loginAuthn(
      response,
      longToken.userid,
    );
    if (result) {
      const jwtToken = await this.authService.createTokenById(longToken.userid);
      res.cookie(this.authCookieName, jwtToken);
    } else {
      res.clearCookie(this.longCookieName);
    }

    res.send({ result });
  }
}
