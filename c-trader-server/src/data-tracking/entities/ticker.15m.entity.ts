import { Entity } from 'typeorm';

import { TickerEntity } from './ticker.entity';

@Entity()
export class FifteenMinutesTickerEntity extends TickerEntity {}
