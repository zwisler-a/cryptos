import { HttpService, Injectable, Logger } from '@nestjs/common';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  CryptoRestRequest,
  CryptoRestResponse,
} from './types/rest-request.interface';

@Injectable()
export class CryptoRestRequestService {
  private logger = new Logger(CryptoRestRequestService.name);
  private baseUrl = 'https://api.crypto.com/';

  constructor(private http: HttpService) {}

  public makeRequest<T>(
    request: CryptoRestRequest<T>,
  ): Observable<CryptoRestResponse<T>> {
    this.logger.debug(`Make REST Request: ${request.url}`);
    return this.http[request.method](this.baseUrl + request.url, {
      params: request.params,
    }).pipe(
      map((res: any) => res.data),
      catchError((err) => {
        this.logger.error(err);
        return EMPTY;
      }),
    );
  }
}
