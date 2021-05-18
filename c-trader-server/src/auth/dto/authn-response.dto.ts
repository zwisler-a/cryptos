export class AuthnResponse {
  id: string;
  rawId: string;
  type: string;
  response: {
    attestationObject: string;
    authenticatorData: string;
    clientDataJSON: string;
  };
}
