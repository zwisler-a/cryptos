import { filter, share } from 'rxjs/operators';
import { SignService } from '../sign.service';
import { PublicAuth, PublicAuthResponse } from '../types/requests/auth.public';
import { CryptoWs } from './ws.class';

export class AuthCryptoWs extends CryptoWs {
  private authenticated = false;

  constructor(url: string, private signService: SignService) {
    super(url);
    this.onOpen$.subscribe(this.authenticate.bind(this));
    this.onMessage$ = this._onMessage$.pipe(this.authenticatedPipe()); 
  }

  send(data: string) {
    if (this.authenticated) {
      super.send(data);
    } else {
      this.logger.debug(`Queueing ${data}`);
      this.queue.push(data);
    }
  }

  private authenticate() {
    this.authenticated = false;
    setTimeout(() => {
      const data = JSON.stringify(
        this.signService.fillAndSign(new PublicAuth()),
      );
      super.send(data);
    }, 1000);
  }

  handleError(json: any) {
    if (json.code === 10002) {
      this.authenticated = false;
      return this.reconnect();  
    }
    super.handleError(json);
  }


  private authenticatedPipe() {
    return filter((json: any) => {
      if (json.method === PublicAuthResponse.method) {
        if (json.code === 0) {
          this.authenticated = true;
          this.resendQueue();
          return false;
        } else {
          this.logger.error(`Failed to autenticate ${this.url}`);
        }
      }
      return true;
    });
  }
}
