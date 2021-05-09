import { Entity } from 'typeorm';

import { TickerEntity } from './ticker.entity';

@Entity()
export class HourTickerEntity extends TickerEntity {}
