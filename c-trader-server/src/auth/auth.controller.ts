import { Body, Controller, Get, Logger, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { response } from 'express';

import { AuthService } from './auth.service';
import { AuthnResponse } from './dto/authn-response.dto';
import { UserToken } from './dto/user-token.dto';
import { JwtAuthGuard } from './jwt.strategy';
import { LocalAuthGuard } from './local.strategy';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('/login')
  @UseGuards(LocalAuthGuard)
  public loginUser(@Req() req, @Res() res) {
    const jwtToken = this.authService.createToken(req.user);
    res.cookie('userid', req.user.id, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });
    res.cookie('auth', jwtToken);
    this.logger.verbose('Login');
    res.send({ jwtToken });
  }

  @Get('/logout')
  @UseGuards(JwtAuthGuard)
  public logout(@Req() req, @Res() res) {
    res.clearCookie('auth');
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
    if (result) {
      res.cookie('userid', user.id, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
    }
    res.send({ result });
  }

  @Get('/authn/get-login-challange')
  async authnLogin(@Req() req, @Res() res) {
    const userId = req.cookies['userid'];
    if (!userId) throw new UnauthorizedException();
    const assertion = await this.authService.getAutnLoginChallange(userId);
    res.send(assertion);
  }

  @Post('/authn/login')
  async authnLoginResponse(
    @Req() req,
    @Res() res,
    @Body() response: AuthnResponse,
  ) {
    const userId = req.cookies['userid'];
    const result = await this.authService.response(response, userId);
    if (result) {
      const jwtToken = await this.authService.createTokenById(userId);
      res.cookie('auth', jwtToken);
    } else {
      res.clearCookie('userid');
    }

    res.send({ result });
  }
}
