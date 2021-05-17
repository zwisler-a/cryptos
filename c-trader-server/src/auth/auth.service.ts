import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; 
import { UserToken } from './user-token.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const init = this.checkInitUser(username, password);
    if (init) return init;
  }

  createToken(user: UserToken) {
    return this.jwtService.sign(user);
  }

  private checkInitUser(username: string, password: string) {
    if (
      process.env.INIT_USER_NAME &&
      process.env.INIT_USER_PW &&
      username === process.env.INIT_USER_NAME &&
      password === process.env.INIT_USER_PW
    ) {
      return {
        username: 'InitUser',
      } as UserToken;
    }
  }
}
