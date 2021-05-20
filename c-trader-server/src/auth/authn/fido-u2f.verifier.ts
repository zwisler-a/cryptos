import { AuthnUtil } from './authn.util';
import { AuthnVerifier, VerificationResult } from './verifier.interface';
import base64url from 'base64url';

export class FidoU2FVerifier implements AuthnVerifier {
  private U2F_USER_PRESENTED = 0x01;

  verifyAssertion(
    webAuthnResponse: any,
    authenticatorData: any,
    authr: any,
  ): VerificationResult {
    let response: any = { verified: false };
    if (authr.fmt === 'fido-u2f') {
      let authrDataStruct = AuthnUtil.parseGetAssertAuthData(authenticatorData);

      if (!(authrDataStruct.flags & this.U2F_USER_PRESENTED))
        throw new Error('User was NOT presented durring authentication!');

      let clientDataHash = AuthnUtil.hash(
        base64url.toBuffer(webAuthnResponse.response.clientDataJSON),
      );
      let signatureBase = Buffer.concat([
        authrDataStruct.rpIdHash,
        authrDataStruct.flagsBuf,
        authrDataStruct.counterBuf,
        clientDataHash,
      ]);

      let publicKey = AuthnUtil.ASN1toPEM(base64url.toBuffer(authr.publicKey));
      let signature = base64url.toBuffer(webAuthnResponse.response.signature);

      response.verified = AuthnUtil.verifySignature(
        signature,
        signatureBase,
        publicKey,
      );

      if (response.verified) {
        if (response.counter <= authr.counter)
          throw new Error('Authr counter did not increase!');

        authr.counter = authrDataStruct.counter;
      }
    }

    return response;
  }

  verifyAttestation(webAuthnResponse, ctapMakeCredResp) {
    let response: any = { verified: false };
    let authrDataStruct = AuthnUtil.parseMakeCredAuthData(
      ctapMakeCredResp.authData,
    );

    if (!(authrDataStruct.flags & this.U2F_USER_PRESENTED))
      throw new Error('User was NOT presented durring authentication!');

    let clientDataHash = AuthnUtil.hash(
      base64url.toBuffer(webAuthnResponse.response.clientDataJSON),
    );
    let reservedByte = Buffer.from([0x00]);
    let publicKey = AuthnUtil.COSEECDHAtoPKCS(authrDataStruct.COSEPublicKey);
    let signatureBase = Buffer.concat([
      reservedByte,
      authrDataStruct.rpIdHash,
      clientDataHash,
      authrDataStruct.credID,
      publicKey,
    ]);

    let PEMCertificate = AuthnUtil.ASN1toPEM(ctapMakeCredResp.attStmt.x5c[0]);
    let signature = ctapMakeCredResp.attStmt.sig;

    response.verified = AuthnUtil.verifySignature(
      signature,
      signatureBase,
      PEMCertificate,
    );

    if (response.verified) {
      response.authrInfo = {
        fmt: 'fido-u2f',
        publicKey: publicKey,
        counter: authrDataStruct.counter,
        credID: authrDataStruct.credID,
      };
    }
    // }

    return response;
  }
}
