import { CryptoRequest } from '../request.interface';
import { CryptoResponse } from '../response.interface';

export class PublicAuth extends CryptoRequest<PublicAuthResponse> {
  method = 'public/auth';
}
export class PublicAuthResponse implements CryptoResponse {
  static method = 'public/auth';
  code = 0;
  id = 0;
  method = '';
}
 