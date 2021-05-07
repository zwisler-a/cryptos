import { Injectable, Logger } from '@nestjs/common';
import { Observable, ReplaySubject, Subscriber, timer } from 'rxjs';
import { delayWhen, map, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { CryptoService } from 'src/crypto/crypto.service';
import { PrivateCreateOrder, PrivateCreateOrderResponse } from 'src/crypto/types/requests/create-order.private';
import { PrivateGetOrderDetails, PrivateGetOrderDetailsResponse } from 'src/crypto/types/requests/get-order-details.private';
import { PositionEntity } from 'src/entities/position.entity';
import { PositionRepository } from 'src/entities/repos/position.repository';

@Injectable()
export class PositionService {
  private logger = new Logger(PositionService.name);
  private positionSubject$ = new ReplaySubject<PositionEntity[]>(1);
  position$: Observable<PositionEntity[]>;
  constructor(
    private positionRepo: PositionRepository,
    private cryptoService: CryptoService,
  ) {
    this.position$ = this.positionSubject$.asObservable();

    this.reloadPositions();
  }

  async createPosition(instrument: string, side: string) {
    const position = new PositionEntity();
    position.instrument = instrument;
    position.side = side;
    await this.positionRepo.save(position);
    this.reloadPositions();
  }

  closePosition(id: string) {
    return new Observable((subscriber) => {
      this.executeClose(subscriber, id);
    }).pipe(tap(() => this.reloadPositions()));
  }

  buyIn(id: string, amount: number) {
    return new Observable((subscriber) => {
      this.executeBuyIn(subscriber, id, amount);
    }).pipe(tap(() => this.reloadPositions()));
  }

  private async reloadPositions() {
    const positions = await this.positionRepo.find();
    this.positionSubject$.next(positions);
  }

  private async executeClose(subscriber: Subscriber<any>, id: string) {
    const position = await this.positionRepo.findOne(id);
    if (!position) {
      this.logger.error(`Cant find position with id ${id}`);
      return subscriber.error(`Cant find position with id ${id}`);
    }
    this.logger.debug(
      `Sell position ${position.id} - ${position.instrument} ...`,
    );

    const req = new PrivateCreateOrder();
    req.params.instrument_name = position.instrument;
    req.params.side = position.side;
    req.params.type = 'MARKET';
    if (position.side == 'SELL') {
      req.params.notional = position.quantity;
      req.params.side = 'BUY';
    }
    if (position.side == 'BUY') {
      req.params.quantity = position.quantity;
      req.params.side = 'SELL';
    }

    this.cryptoService
      .makeRequest(req)
      .pipe(this.checkIfOrderIsExecuted())
      .subscribe(async (res) => {
        if (res.result.order_info.status !== 'FILLED') {
          this.logger.error('Order did not get filed!');
          return;
        }
        await this.positionRepo.delete(id);
        subscriber.next(position);
        subscriber.complete();
      });
  }

  private async executeBuyIn(subscriber: Subscriber<any>, id, amount) {
    const position = await this.positionRepo.findOne(id);
    if (!position) {
      this.logger.error(`Cant find position with id ${id}`);
      return subscriber.error(`Cant find position with id ${id}`);
    }
    this.logger.debug(
      `Buy In Position ${position.id} - ${position.instrument} ...`,
    );

    const req = new PrivateCreateOrder();
    req.params.instrument_name = position.instrument;
    req.params.side = position.side;
    req.params.type = 'MARKET';
    if (position.side == 'SELL') req.params.quantity = amount;
    if (position.side == 'BUY') req.params.notional = amount;

    this.cryptoService
      .makeRequest(req)
      .pipe(this.checkIfOrderIsExecuted())
      .subscribe(async (res) => {
        if (res.result.order_info.status !== 'FILLED') {
          this.logger.error('Order did not get filed!');
          return;
        }
        this.updatePosition(res, position);
        await this.positionRepo.save(position);
        subscriber.next(position);
        subscriber.complete();
      });
  }

  private updatePosition(
    order: PrivateGetOrderDetailsResponse,
    position: PositionEntity,
  ) {
    const sumPrice = order.result.trade_list.reduce(
      (a, val) => (a += val.traded_price * val.traded_quantity),
      0,
    );
    const sumQuantity = order.result.trade_list.reduce(
      (a, val) => (a += val.traded_quantity),
      0,
    );

    const totalCost = sumPrice + position.avgBuyIn * position.quantity;
    const totalQuant = position.quantity + sumQuantity;
    const avgBuyIn = totalCost / totalQuant;

    position.avgBuyIn = avgBuyIn;
    position.quantity = totalQuant;
  }

  private checkIfOrderIsExecuted() {
    return mergeMap<
      PrivateCreateOrderResponse,
      Observable<PrivateGetOrderDetailsResponse>
    >((data) =>
      this.cryptoService
        .makeRequest(new PrivateGetOrderDetails(data.result.order_id))
        .pipe(
          map((res) => {
            if (res.result.order_info.status === 'FILLED') {
              return res;
            }
            if (res.result.order_info.status === 'ACTIVE') {
              throw res.result.order_info.status;
            }
            return res;
          }),
          retryWhen((errors) => errors.pipe(delayWhen((val) => timer(1000)))),
        ),
    );
  }
}
