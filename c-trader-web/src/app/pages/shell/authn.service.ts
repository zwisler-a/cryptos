import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, of } from 'rxjs';
import base64url from 'base64url';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

@Injectable()
export class AuthnService {
  constructor(private http: HttpClient) {}

  login() {
    return from(
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    ).pipe(
      map((res) => {
        if (!res) throw Error('Platform auth not supported!');
      }),
      mergeMap(() => this.getAssertionChallenge()),
      map((res) => this.preformatGetAssertReq(res)),
      mergeMap((opts) => from(navigator.credentials.get(opts))),
      map((res) => this.publicKeyCredentialToJSON(res as any)),
      mergeMap((res) => this.sendAuthnLoginResponse(res)),
      catchError((err) => (console.error(err), err))
    );
  }

  private getAssertionChallenge() {
    return this.http.get('/auth/authn/get-login-challange');
  }

  preformatGetAssertReq(getAssert: any) {
    getAssert.challenge = this.strToBin(getAssert.challenge);
    getAssert.timeout = 10000;
    for (let allowCred of getAssert.allowCredentials) {
      allowCred.id = this.strToBin(allowCred.id);
    }

    return { publicKey: getAssert };
  }

  private sendAuthnLoginResponse(response: any) {
    return this.http.post('/auth/authn/login', response);
  }

  register() {
    return this.getCredChallange().pipe(
      map((res) => this.preformatMakeCredReq(res)),
      mergeMap((cred) =>
        from(navigator.credentials.create({ publicKey: cred }))
      ),
      map((res) => this.publicKeyCredentialToJSON(res as any)),
      mergeMap((res) => this.sendAuthnRegisterResponse(res))
    );
  }

  private sendAuthnRegisterResponse(response: any) {
    return this.http.post('/auth/authn/register', response);
  }

  private getCredChallange() {
    return this.http.get('/auth/authn/get-register-challange');
  }

  private preformatMakeCredReq(makeCredReq: any) {
    makeCredReq.challenge = this.strToBin(makeCredReq.challenge);
    makeCredReq.user.id = this.strToBin(makeCredReq.user.id);
    return makeCredReq;
  }

  private publicKeyCredentialToJSON(pubKeyCred: PublicKeyCredential): any {
    const res = {
      id: pubKeyCred.id,
      rawId: this.binToStr(pubKeyCred.rawId),
      type: pubKeyCred.type,
      response: {} as any,
    };
    const response: any = pubKeyCred.response;
    if (pubKeyCred.response.clientDataJSON) {
      res.response.clientDataJSON = this.binToStr(
        pubKeyCred.response.clientDataJSON
      );
    }
    if (response.attestationObject) {
      res.response.attestationObject = this.binToStr(
        response.attestationObject
      );
    }
    if (response.authenticatorData) {
      res.response.authenticatorData = this.binToStr(
        response.authenticatorData
      );
    }
    if (response.signature) {
      res.response.signature = this.binToStr(response.signature);
    }
    return res;
  }

  strToBin(str: string): Buffer {
    return base64url.toBuffer(str);
  }

  binToStr(bin: string | any): string {
    return base64url.encode(bin);
  }
}
