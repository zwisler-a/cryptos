import base64url from 'base64url';
import * as cbor from 'cbor';
import { AndroidSafetynetVerifier } from './android-safetynet.verifier';

import { AuthnUtil } from './authn.util';
import { FidoU2FVerifier } from './fido-u2f.verifier';
import { AuthnVerifier } from './verifier.interface';

export class AuthnVerificator {
  private fmts: { [key: string]: AuthnVerifier } = {
    'fido-u2f': new FidoU2FVerifier(),
    'android-safetynet': new AndroidSafetynetVerifier(),
  };

  generateServerMakeCredRequest(username, displayName, id) {
    return {
      challenge: AuthnUtil.randomBase64URLBuffer(32),
      rp: {
        name: 'CryptOS',
      },
      user: {
        id: id,
        name: username,
        displayName: displayName,
      },
      attestation: 'direct',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'preferred',
      },
      pubKeyCredParams: [
        {
          type: 'public-key',
          alg: -7, // "ES256" IANA COSE Algorithms registry
        },
      ],
    };
  }

  verifyAuthenticatorAssertionResponse(webAuthnResponse, authenticators) {
    let authr = AuthnUtil.findAuthr(webAuthnResponse.id, authenticators);
    let authenticatorData = base64url.toBuffer(
      webAuthnResponse.response.authenticatorData,
    );
    const verifier = this.fmts[authr.fmt];
    if (verifier) {
      return verifier.verifyAssertion(
        webAuthnResponse,
        authenticatorData,
        authr,
      );
    } else {
      throw Error('Unsupported attestation format.');
    }
  }

  /**
   * Generates getAssertion request
   * @param  {Array} authenticators              - list of registered authenticators
   * @return {PublicKeyCredentialRequestOptions} - server encoded get assertion request
   */
  generateServerGetAssertion(authenticators) {
    let allowCredentials = [];
    for (let authr of authenticators) {
      allowCredentials.push({
        type: 'public-key',
        id: authr.credID,
        transports: ['usb', 'nfc', 'ble', 'internal'],
      });
    }
    return {
      userVerification: 'required',
      challenge: AuthnUtil.randomBase64URLBuffer(32),
      allowCredentials: allowCredentials,
    };
  }

  verifyAuthenticatorAttestationResponse(webAuthnResponse) {
    let attestationBuffer = base64url.toBuffer(
      webAuthnResponse.response.attestationObject,
    );
    let ctapMakeCredResp = cbor.decodeAllSync(attestationBuffer)[0];

    const verifier = this.fmts[ctapMakeCredResp.fmt];
    if (verifier) {
      return verifier.verifyAttestation(webAuthnResponse, ctapMakeCredResp);
    } else {
      throw Error('Unsupported attestation format.');
    }
  }
}
