import { CryptoRequest } from '../request.interface';
import { CryptoResponse } from '../response.interface';

export class PublicRespondHeartbeat extends CryptoRequest<any> {
  method = 'public/respond-heartbeat';
}

export class PublicHeartbeat implements CryptoResponse {
  static method = 'public/heartbeat';
  code = 0;
  id = 0;
  method = '';
}
