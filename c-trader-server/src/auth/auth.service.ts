import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import base64url from 'base64url';
import { AuthnVerificator } from './authn/authn-verificator.class';

import { AuthnResponse } from './dto/authn-response.dto';
import { UserToken } from './dto/user-token.dto';
import { AuthInfos } from './entity/auth-info.entity';
import { AuthInfoRepository } from './entity/auth-info.repository';
import { UserEntity } from './entity/user.entity';
import { UserRepository } from './entity/user.repository';
import { AuthnUtils } from './utils';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  private authnUtils = new AuthnVerificator();
  constructor(
    private jwtService: JwtService,
    private userRepo: UserRepository,
    private authInfoRepo: AuthInfoRepository,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // TODO
    const user = await this.userRepo.find({ where: { username, password } });
    if (user) return user;
  }
  async createTokenById(id: string) {
    const user = await this.userRepo.findOne(id);
    return this.createToken(user);
  }
  createToken(user: UserEntity) {
    const token: UserToken = {
      id: user.id,
      username: user.username,
    };
    return this.jwtService.sign(token);
  }

  async getAuthnRegisterChallenge(userToken: UserToken): Promise<any> {
    this.logger.log('Register user');
    try {
      const challengeMakeCred = this.authnUtils.generateServerMakeCredRequest(
        userToken.username,
        userToken.username,
        userToken.id,
      );
      const user = await this.userRepo.findOne(userToken.id);
      if (!user) throw new Error('Unknown user!');
      user.challenge = challengeMakeCred.challenge;
      await this.userRepo.save(user);
      return challengeMakeCred;
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async registerAuthnCredentials(
    autnResponse: AuthnResponse,
    userToken: UserToken,
  ) {
    const user = await this.userRepo.findOne(userToken.id, {
      relations: ['authInfos'],
    });
    const clientData = JSON.parse(
      base64url.decode(autnResponse.response.clientDataJSON),
    );

    if (autnResponse.type !== 'public-key')
      throw Error('Response is not public-key');
    if (clientData.challenge !== user.challenge)
      throw new Error(
        `Challenges do not match! "${clientData.challenge}" should be "${user.challenge}"`,
      );
    if (clientData.origin !== `this.config.get('ORIGIN_AUTHENT')` && false)
      throw new Error('Domain does not match!');
    if (autnResponse.response.attestationObject === undefined)
      throw new Error('AttestationObject is not defined!');

    let result = this.authnUtils.verifyAuthenticatorAttestationResponse(
      autnResponse,
    );

    if (result.verified) {
      this.logger.debug('Adding authInfo');
      user.authInfos = user.authInfos ? user.authInfos : [];

      let authInfo = new AuthInfos();
      authInfo.counter = result.authrInfo.counter;
      authInfo.credID = base64url.encode(result.authrInfo.credID);
      authInfo.fmt = result.authrInfo.fmt;
      authInfo.publicKey = base64url.encode(result.authrInfo.publicKey);
      authInfo.user = user;
      authInfo = await this.authInfoRepo.save(authInfo);

      user.authInfos.push(authInfo);
      await this.userRepo.save(user);
    }

    return result.verified;
  }

  async getAutnLoginChallange(userId: string): Promise<any> {
    const user = await this.userRepo.findOne(userId, {
      relations: ['authInfos'],
    });
    if (!user) {
      throw new Error('Unkown user...');
    }
    const getAssertion: any = this.authnUtils.generateServerGetAssertion(
      user.authInfos,
    );
    // getAssertion.status = 'ok';

    user.challenge = getAssertion.challenge;
    await this.userRepo.save(user);

    return getAssertion;
  }

  async response(
    autnResponse: AuthnResponse,
    userId: string,
  ): Promise<boolean> {
    if (autnResponse.type !== 'public-key') {
      throw Error('Response is not public-key');
    } else {
      const user = await this.userRepo.findOne(userId, {
        relations: ['authInfos'],
      });
      const clientData = JSON.parse(
        base64url.decode(autnResponse.response.clientDataJSON),
      );

      /* Check challenge... */
      if (clientData.challenge !== user.challenge) {
        throw new Error('Challenges do not match!');
      }

      /* ...and origin */
      // if (clientData.origin !== this.config.get('ORIGIN_AUTHENT')) {
      //   return JSON.stringify({
      //     status: 'failed',
      //     message: "Origins don't match!",
      //   });
      // }

      let result;

      if (autnResponse.response.attestationObject !== undefined) {
        /* This is create cred */
        result = this.authnUtils.verifyAuthenticatorAttestationResponse(
          autnResponse,
        );

        if (result.verified) {
          this.logger.debug('Adding authInfo');
          user.authInfos = user.authInfos ? user.authInfos : [];

          let authInfo = new AuthInfos();
          authInfo.counter = result.authrInfo.counter;
          authInfo.credID = result.authrInfo.credID;
          authInfo.fmt = result.authrInfo.fmt;
          authInfo.publicKey = base64url.encode(result.authrInfo.publicKey);
          authInfo.user = user;
          authInfo = await this.authInfoRepo.save(authInfo);

          user.authInfos.push(authInfo);
          await this.userRepo.save(user);
        }
      } else if (autnResponse.response.authenticatorData !== undefined) {
        /* This is get assertion */
        result = this.authnUtils.verifyAuthenticatorAssertionResponse(
          autnResponse,
          user.authInfos,
        );
      } else {
        throw new Error('Unknown response type ...');
      }

      if (result.verified) {
        return true;
      } else {
        return false;
      }
    }
  }

  // async validateUser(payload: JWT): Promise<any> {
  //   const response = await RegisterModel.findOne({
  //     username: payload.username,
  //   });
  //   const user = response._doc;
  //   return user;
  // }

  // isLoggedIn(payload: JWT): any {
  //   return payload ? payload.loggedIn : false;
  // }
}
