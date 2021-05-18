import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import base64url from 'base64url';
import { from } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

@Injectable()
export class AuthnService {
  constructor(private http: HttpClient) {}

  login() {
    return this.getAssertionChallenge().pipe(
      map((res) => this.preformatGetAssertReq(res)),
      mergeMap((publicKey) => from(navigator.credentials.get({ publicKey }))),
      map((res) => this.publicKeyCredentialToJSON(res)),
      mergeMap((res) => this.sendAuthnLoginResponse(res))
    );
  }

  private getAssertionChallenge() {
    return this.http.get('/auth/authn/login');
  }

  preformatGetAssertReq(getAssert: any) {
    getAssert.challenge = this.decode(getAssert.challenge);

    for (let allowCred of getAssert.allowCredentials) {
      allowCred.id = this.decode(allowCred.id);
    }

    return getAssert;
  }

  private sendAuthnLoginResponse(response: any) {
    return this.http.post('/auth/authn/login-response', response);
  }

  register() {
    return this.getCredChallange().pipe(
      map((res) => this.preformatMakeCredReq(res)),
      mergeMap((cred) =>
        from(navigator.credentials.create({ publicKey: cred }))
      ),
      map((res) => this.publicKeyCredentialToJSON(res)),
      mergeMap((res) => this.sendAuthnRegisterResponse(res))
    );
  }

  private sendAuthnRegisterResponse(response: any) {
    return this.http.post('/auth/authn/register', response);
  }

  private getCredChallange() {
    return this.http.get('/auth/authn/get-challange');
  }

  private preformatMakeCredReq(makeCredReq: any) {
    makeCredReq.challenge = this.decode(makeCredReq.challenge);
    makeCredReq.user.id = this.decode(makeCredReq.user.id);
    return makeCredReq;
  }

  private publicKeyCredentialToJSON(pubKeyCred: any): any {
    if (pubKeyCred instanceof Array) {
      let arr = [];
      for (let i of pubKeyCred) arr.push(this.publicKeyCredentialToJSON(i));

      return arr;
    }

    if (pubKeyCred instanceof ArrayBuffer) {
      return base64url.encode(pubKeyCred as any);
    }

    if (pubKeyCred instanceof Object) {
      let obj: any = {};

      for (let key in pubKeyCred) {
        obj[key] = this.publicKeyCredentialToJSON(pubKeyCred[key]);
      }

      return obj;
    }

    return pubKeyCred;
  }

  decode(base64: string) {
    var chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    // Use a lookup table to find the index.
    var lookup = new Uint8Array(256);
    for (var i = 0; i < chars.length; i++) {
      lookup[chars.charCodeAt(i)] = i;
    }
    var bufferLength = base64.length * 0.75,
      len = base64.length,
      p = 0,
      encoded1,
      encoded2,
      encoded3,
      encoded4;

    var arraybuffer = new ArrayBuffer(bufferLength),
      bytes = new Uint8Array(arraybuffer);

    for (var i = 0; i < len; i += 4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i + 1)];
      encoded3 = lookup[base64.charCodeAt(i + 2)];
      encoded4 = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  }
}
