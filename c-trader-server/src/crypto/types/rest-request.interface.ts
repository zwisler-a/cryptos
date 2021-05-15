export class CryptoRestRequest<T> {
  method: string;
  url: string;
  params: { [key: string]: string };
  response?: CryptoRestResponse<T>;
}

export class CryptoRestResponse<T> {
  code: number;
  method: string;
  result: T;
}
