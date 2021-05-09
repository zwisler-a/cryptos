import { Entity } from 'typeorm';

import { TickerEntity } from './ticker.entity';

@Entity()
export class ThrityMinutesTickerEntity extends TickerEntity {}
