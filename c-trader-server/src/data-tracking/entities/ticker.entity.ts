import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class TickerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  instrument: string;
  @Column({ type: 'double' })
  high: number; // Price of the 24h highest trade
  @Column({ type: 'double' })
  volume: number; // The total 24h traded volume
  @Column({ type: 'double' })
  trade: number; // The price of the latest trade, null if there weren't any trades
  @Column({ type: 'double' })
  last: number; // Price of the 24h lowest trade, null if there weren't any trades
  @Column({ type: 'double' })
  bid: number; // The current best bid price, null if there aren't any bids
  @Column({ type: 'double' })
  ask: number; // The current best ask price, null if there aren't any asks
  @Column({ type: 'double' })
  change: number; // 24-hour price change, null if there weren't any trades
  @Column({ type: 'timestamp' })
  time: Date; // update time
}
