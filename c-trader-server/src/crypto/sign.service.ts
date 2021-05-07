import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto-js';

import {
  CryptoRequest,
  FilledCryptoRequest,
  SignedCryptoRequest,
} from './types/request.interface';

@Injectable()
export class SignService {
  private apiKey = process.env.CRYPTO_API_KEY; /* User API Key */
  private apiSecret = process.env.CRYPTO_API_SECRET; /* User API Secret */
  private requestCounter = 11;
  public signRequest(request: FilledCryptoRequest<any>) {
    const { id, method, params, nonce } = request;

    const paramsString =
      params == null
        ? ''
        : Object.keys(params)
            .sort()
            .reduce((a, b) => {
              return a + b + params[b];
            }, '');

    const sigPayload = method + id + this.apiKey + paramsString + nonce;

    const signedRequest: SignedCryptoRequest<any> = request;
    signedRequest.api_key = this.apiKey;
    signedRequest.sig = crypto
      .HmacSHA256(sigPayload, this.apiSecret)
      .toString(crypto.enc.Hex);

    return signedRequest;
  }

  public fillRequest(request: CryptoRequest<any>): FilledCryptoRequest<any> {
    return {
      ...request,
      id: this.requestCounter++,
      nonce: Date.now(),
    };
  }

  public fillAndSign(request: CryptoRequest<any>): SignedCryptoRequest<any> {
    return this.signRequest(this.fillRequest(request));
  }
}
