import * as crypto from 'crypto';
import base64url from 'base64url';
import * as cbor from 'cbor';

export class AuthnUtil {
  static randomBase64URLBuffer(len) {
    return base64url.encode(crypto.randomBytes(len || 32));
  }

  /**
   * Takes signature, data and PEM public key and tries to verify signature
   * @param  {Buffer} signature
   * @param  {Buffer} data
   * @param  {String} publicKey - PEM encoded public key
   * @return {Boolean}
   */
  static verifySignature(signature, data, publicKey) {
    return crypto
      .createVerify('SHA256')
      .update(data)
      .verify(publicKey, signature);
  }

  /**
   * Returns SHA-256 digest of the given data.
   * @param  {Buffer} data - data to hash
   * @return {Buffer}      - the hash
   */
  static hash(data) {
    return crypto.createHash('SHA256').update(data).digest();
  }

  /**
   * Takes COSE encoded public key and converts it to RAW PKCS ECDHA key
   * @param  {Buffer} COSEPublicKey - COSE encoded public key
   * @return {Buffer}               - RAW PKCS encoded public key
   */
  static COSEECDHAtoPKCS(COSEPublicKey) {
    /* 
       +------+-------+-------+---------+----------------------------------+
       | name | key   | label | type    | description                      |
       |      | type  |       |         |                                  |
       +------+-------+-------+---------+----------------------------------+
       | crv  | 2     | -1    | int /   | EC Curve identifier - Taken from |
       |      |       |       | tstr    | the COSE Curves registry         |
       |      |       |       |         |                                  |
       | x    | 2     | -2    | bstr    | X Coordinate                     |
       |      |       |       |         |                                  |
       | y    | 2     | -3    | bstr /  | Y Coordinate                     |
       |      |       |       | bool    |                                  |
       |      |       |       |         |                                  |
       | d    | 2     | -4    | bstr    | Private key                      |
       +------+-------+-------+---------+----------------------------------+
    */

    let coseStruct = cbor.decodeAllSync(COSEPublicKey)[0];
    let tag = Buffer.from([0x04]);
    let x = coseStruct.get(-2);
    let y = coseStruct.get(-3);

    return Buffer.concat([tag, x, y]);
  }

  /**
   * Convert binary certificate or public key to an OpenSSL-compatible PEM text format.
   * @param  {Buffer} buffer - Cert or PubKey buffer
   * @return {String}             - PEM
   */
  static ASN1toPEM(pkBuffer) {
    if (!Buffer.isBuffer(pkBuffer))
      throw new Error('ASN1toPEM: pkBuffer must be Buffer.');

    let type;
    if (pkBuffer.length == 65 && pkBuffer[0] == 0x04) {
      pkBuffer = Buffer.concat([
        Buffer.from(
          '3059301306072a8648ce3d020106082a8648ce3d030107034200',
          'hex',
        ),
        pkBuffer,
      ]);

      type = 'PUBLIC KEY';
    } else {
      type = 'CERTIFICATE';
    }

    let b64cert = pkBuffer.toString('base64');

    let PEMKey = '';
    for (let i = 0; i < Math.ceil(b64cert.length / 64); i++) {
      let start = 64 * i;

      PEMKey += b64cert.substr(start, 64) + '\n';
    }

    PEMKey = `-----BEGIN ${type}-----\n` + PEMKey + `-----END ${type}-----\n`;

    return PEMKey;
  }

  /**
   * Parses authenticatorData buffer.
   * @param  {Buffer} buffer - authenticatorData buffer
   * @return {Object}        - parsed authenticatorData struct
   */
  static parseMakeCredAuthData(buffer) {
    let rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);
    let flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    let flags = flagsBuf[0];
    let counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);
    let counter = counterBuf.readUInt32BE(0);
    let aaguid = buffer.slice(0, 16);
    buffer = buffer.slice(16);
    let credIDLenBuf = buffer.slice(0, 2);
    buffer = buffer.slice(2);
    let credIDLen = credIDLenBuf.readUInt16BE(0);
    let credID = buffer.slice(0, credIDLen);
    buffer = buffer.slice(credIDLen);
    let COSEPublicKey = buffer;

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
  /**
   * Takes an array of registered authenticators and find one specified by credID
   * @param  {String} credID        - base64url encoded credential
   * @param  {Array} authenticators - list of authenticators
   * @return {Object}               - found authenticator
   */
  static findAuthr(credID, authenticators) {
    for (let authr of authenticators) {
      if (authr.credID === credID) return authr;
    }

    throw new Error(`Unknown authenticator with credID ${credID}!`);
  }

  /**
   * Parses AuthenticatorData from GetAssertion response
   * @param  {Buffer} buffer - Auth data buffer
   * @return {Object}        - parsed authenticatorData struct
   */
  static parseGetAssertAuthData(buffer) {
    let rpIdHash = buffer.slice(0, 32);
    buffer = buffer.slice(32);
    let flagsBuf = buffer.slice(0, 1);
    buffer = buffer.slice(1);
    let flags = flagsBuf[0];
    let counterBuf = buffer.slice(0, 4);
    buffer = buffer.slice(4);
    let counter = counterBuf.readUInt32BE(0);

    return { rpIdHash, flagsBuf, flags, counter, counterBuf };
  }
}
