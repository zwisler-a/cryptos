export class CryptoRequest<T> {
  marketApi?: boolean;
  method: string;
  params?: any;
  response?: T;
}
export interface FilledCryptoRequest<T> extends CryptoRequest<T> {
  id: number;
  nonce: number; //Current timestamp (milliseconds since the Unix epoch)
}
export interface SignedCryptoRequest<T> extends FilledCryptoRequest<T> {
  sig?: string;
  api_key?: string;
}
