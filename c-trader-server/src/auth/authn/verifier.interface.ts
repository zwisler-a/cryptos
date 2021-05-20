export interface VerificationResult {
  verified: boolean;
  authrInfo: {
    fmt: string;
    publicKey: string;
    counter: string;
    credID: string;
  };
}

export interface AuthnVerifier {
  verifyAttestation(webAuthnResponse, ctapMakeCredResp): VerificationResult;
  verifyAssertion(webAuthnResponse, authenticatorData, authr): VerificationResult;
}
