import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BalanceEntitiy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  currency: string;

  @Column({ type: 'double' })
  value: number;

  @Column({ type: 'double' })
  value_in_usdt: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
