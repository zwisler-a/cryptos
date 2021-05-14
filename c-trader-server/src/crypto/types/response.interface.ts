export class CryptoBaseResponse {
  method: string; //	Method invoked
  result?: any; //	Result object
}

export class CryptoResponse extends CryptoBaseResponse {
  id: number; //	Original request identifier
  code: number; //0 for success, see below for full list
  message?: string; //	(optional) For server or error messages
  original?: string; //	(optional) Original request as a string, for error cases

  static isResponse(res: CryptoBaseResponse | any): res is CryptoResponse {
    return (
      (res as CryptoResponse).id !== undefined &&
      (res as CryptoResponse).id != -1
    );
  }
}
