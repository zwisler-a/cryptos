import { CryptoRequest } from '../request.interface';
import { CryptoResponse } from '../response.interface';

export class PrivateGetAccountSummary
  extends CryptoRequest<PrivateGetAccountSummaryResponse> {
  method = 'private/get-account-summary';
}

export interface PrivateGetAccountSummaryResponse extends CryptoResponse {
  result: {
    accounts: {
      currency: string;
      balance: number;
      available: number;
      order: number;
      stake: number;
    }[];
  };
}
