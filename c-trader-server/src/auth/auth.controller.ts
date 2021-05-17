import { Controller, Get, Logger, Post, Req, Res, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
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
    res.cookie('auth', jwtToken);
    this.logger.verbose('Login');
    res.send({jwtToken});
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
}
