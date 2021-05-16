import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PositionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  instrument: string;

  @Column({ default: false })
  closed: boolean;

  @Column({ default: 0, type: 'double' })
  avgBuyIn: number;

  @Column({ default: 0, type: 'double' })
  quantity: number;

  @Column({ default: 'BUY' })
  side: string;
}
