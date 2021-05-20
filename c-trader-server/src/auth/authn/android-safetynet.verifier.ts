import { AuthnUtil } from './authn.util';
import { AuthnVerifier, VerificationResult } from './verifier.interface';
import * as jsrsasign from 'jsrsasign';

export class AndroidSafetynetVerifier implements AuthnVerifier {
  private gsr2 =
    'MIIDujCCAqKgAwIBAgILBAAAAAABD4Ym5g0wDQYJKoZIhvcNAQEFBQAwTDEgMB4GA1UECxMXR2xvYmFsU2lnbiBSb290IENBIC0gUjIxEzARBgNVBAoTCkdsb2JhbFNpZ24xEzARBgNVBAMTCkdsb2JhbFNpZ24wHhcNMDYxMjE1MDgwMDAwWhcNMjExMjE1MDgwMDAwWjBMMSAwHgYDVQQLExdHbG9iYWxTaWduIFJvb3QgQ0EgLSBSMjETMBEGA1UEChMKR2xvYmFsU2lnbjETMBEGA1UEAxMKR2xvYmFsU2lnbjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKbPJA6+Lm8omUVCxKs+IVSbC9N/hHD6ErPLv4dfxn+G07IwXNb9rfF73OX4YJYJkhD10FPe+3t+c4isUoh7SqbKSaZeqKeMWhG8eoLrvozps6yWJQeXSpkqBy+0Hne/ig+1AnwblrjFuTosvNYSuetZfeLQBoZfXklqtTleiDTsvHgMCJiEbKjNS7SgfQx5TfC4LcshytVsW33hoCmEofnTlEnLJGKRILzdC9XZzPnqJworc5HGnRusyMvo4KD0L5CLTfuwNhv2GXqF4G3yYROIXJ/gkwpRl4pazq+r1feqCapgvdzZX99yqWATXgAByUr6P6TqBwMhAo6CygPCm48CAwEAAaOBnDCBmTAOBgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUm+IHV2ccHsBqBt5ZtJot39wZhi4wNgYDVR0fBC8wLTAroCmgJ4YlaHR0cDovL2NybC5nbG9iYWxzaWduLm5ldC9yb290LXIyLmNybDAfBgNVHSMEGDAWgBSb4gdXZxwewGoG3lm0mi3f3BmGLjANBgkqhkiG9w0BAQUFAAOCAQEAmYFThxxol4aR7OBKuEQLq4GsJ0/WwbgcQ3izDJr86iw8bmEbTUsp9Z8FHSbBuOmDAGJFtqkIk7mpM0sYmsL4h4hO291xNBrBVNpGP+DTKqttVCL1OmLNIG+6KYnX3ZHu01yiPqFbQfXf5WRDLenVOavSot+3i9DAgBkcRcAtjOj4LaR0VknFBbVPFd5uRHg5h6h+u/N5GJG79G+dwfCMNYxdAfvDbbnvRG15RjF+Cv6pgsH/76tuIMRQyV+dTZsXjAzlAcmgQWpzU/qlULRuJQ/7TBj0/VLZjmmx6BEP3ojY+x1J96relc8geMJgEtslQIxq/H5COEBkEveegeGTLg==';

  private base64ToPem(str, type = 'CERTIFICATE') {
    const split = str.match(/.{1,65}/g).join('\n'); // split into 65-character lines
    return `-----BEGIN ${type}-----\n${split}\n-----END ${type}-----\n`;
  }

  private getCertificateSubject(certificate): any {
    const subjectCert = new jsrsasign.X509();
    subjectCert.readCertPEM(certificate);

    const subjectString = subjectCert.getSubjectString();
    const subjectFields = subjectString.slice(1).split('/');

    let fields = {};
    for (let field of subjectFields) {
      const [key, val] = field.split('=');
      fields[key] = val;
    }

    return fields;
  }

  private verifySigningChain(certificates) {
    if (new Set(certificates).size !== certificates.length) {
      throw new Error(
        'Failed to validate certificates path! Duplicate certificates detected!',
      );
    }

    certificates.forEach((subjectPem, i) => {
      const subjectCert = new jsrsasign.X509();
      subjectCert.readCertPEM(subjectPem);

      let issuerPem = '';
      if (i + 1 >= certificates.length) issuerPem = subjectPem;
      else issuerPem = certificates[i + 1];

      const issuerCert = new jsrsasign.X509();
      issuerCert.readCertPEM(issuerPem);

      if (subjectCert.getIssuerString() !== issuerCert.getSubjectString()) {
        throw new Error(
          `Failed to validate certificate path! Issuers don't match!`,
        );
      }

      const subjectCertStruct = jsrsasign.ASN1HEX.getTLVbyList(
        subjectCert.hex,
        0,
        [0],
      );
      const algorithm = subjectCert.getSignatureAlgorithmField();
      const signatureHex = subjectCert.getSignatureValueHex();

      const signature = new jsrsasign.crypto.Signature({ alg: algorithm });
      signature.init(issuerPem);
      signature.updateHex(subjectCertStruct);

      if (!signature.verify(signatureHex)) {
        throw new Error(
          'Failed to validate certificate path! Signature is not valid!',
        );
      }
    });
  }
  parseAttestationData(buffer) {
    const rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);
    const flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    const flagsInt = flagsBuf[0];
    const flags = {
      up: !!(flagsInt & 0x01),
      uv: !!(flagsInt & 0x04),
      at: !!(flagsInt & 0x40),
      ed: !!(flagsInt & 0x80),
      flagsInt,
    };

    const counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);
    const counter = counterBuf.readUInt32BE(0);

    let aaguid;
    let credID;
    let COSEPublicKey;

    if (flags.at) {
      aaguid = buffer.slice(0, 16);
      buffer = buffer.slice(16);
      const credIDLenBuf = buffer.slice(0, 2);
      buffer = buffer.slice(2);
      const credIDLen = credIDLenBuf.readUInt16BE(0);
      credID = buffer.slice(0, credIDLen);
      buffer = buffer.slice(credIDLen);
      COSEPublicKey = buffer;
    }

    return {
      rpIdHash,
      flagsBuf,
      flags,
      counter,
      counterBuf,
      aaguid,
      credID,
      COSEPublicKey,
    };
  }

  verifyAttestation(
    webAuthnResponse: any,
    ctapMakeCredResp: any,
  ): VerificationResult {
    const encodedJws = ctapMakeCredResp.attStmt.response.toString();
    const jwsParts = encodedJws.split('.');
    const jws = {
      header: JSON.parse(Buffer.from(jwsParts[0], 'base64').toString()),
      payload: JSON.parse(Buffer.from(jwsParts[1], 'base64').toString()),
    };

    // Check device integrity.
    if (!jws.payload.ctsProfileMatch && !jws.payload.basicIntegrity) {
      return undefined;
    }

    // Verify that the nonce is identical to the hash of authenticatorData + clientDataHash.
    const clientDataHash = AuthnUtil.hash(
      Buffer.from(webAuthnResponse.response.clientDataJSON, 'base64'),
    );
    const authAndClientData = Buffer.concat([
      ctapMakeCredResp.authData,
      clientDataHash,
    ]);
    const expectedNonce = AuthnUtil.hash(authAndClientData).toString('base64');
    if (expectedNonce !== jws.payload.nonce) {
      return undefined;
    }

    // Verify that the SafetyNet response actually came from the SafetyNet service.
    const formattedCerts = jws.header.x5c
      .concat([this.gsr2])
      .map((cert) => this.base64ToPem(cert, 'CERTIFICATE'));
    const leafCert = formattedCerts[0];
    const subject = this.getCertificateSubject(leafCert);
    if (subject.CN !== 'attest.android.com') {
      return undefined;
    }
    try {
      this.verifySigningChain(formattedCerts);
    } catch (err) {
      return undefined;
    }

    // Verify the signature of the JWS message.
    const leafCertX509 = new jsrsasign.X509();
    leafCertX509.readCertPEM(leafCert);
    const leafPublicKey = Buffer.from(
      leafCertX509.getPublicKeyHex(),
      'hex',
    ).toString('base64');
    const leafPublicKeyPem = this.base64ToPem(leafPublicKey, 'PUBLIC KEY');
    if (!jsrsasign.jws.JWS.verify(encodedJws, leafPublicKeyPem)) {
      return undefined;
    }

    const authenticatorData = this.parseAttestationData(
      ctapMakeCredResp.authData,
    );

    const publicKey = AuthnUtil.COSEECDHAtoPKCS(
      authenticatorData.COSEPublicKey,
    );

    return {
      verified: true,
      authrInfo: {
        fmt: 'android-safetynet',
        publicKey: publicKey as any,
        counter: authenticatorData.counter,
        credID: authenticatorData.credID,
      },
    };
  }
  verifyAssertion(
    webAuthnResponse: any,
    useless: any,
    authr: any,
  ): VerificationResult {
    const authenticatorDataBuffer = Buffer.from(
      webAuthnResponse.response.authenticatorData,
      'base64',
    );
    const authenticatorData = this.parseAttestationData(authenticatorDataBuffer);

    if (!authenticatorData.flags.up) {
      throw new Error('User was NOT presented durring authentication!');
    }

    const clientDataHash = AuthnUtil.hash(
      Buffer.from(webAuthnResponse.response.clientDataJSON, 'base64'),
    );
    const signatureBaseBuffer = Buffer.concat([
      authenticatorDataBuffer,
      clientDataHash,
    ]);

    const publicKey = AuthnUtil.ASN1toPEM(
      Buffer.from(authr.publicKey, 'base64'),
    );
    const signatureBuffer = Buffer.from(
      webAuthnResponse.response.signature,
      'base64',
    );
    const result = AuthnUtil.verifySignature(
        signatureBuffer,
        signatureBaseBuffer,
        publicKey,
    );
    return { authrInfo: null, verified: result };
  }
}
