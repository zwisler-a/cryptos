import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class AuthInfos {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ManyToOne(() => UserEntity, (user) => user.authInfos)
  user: UserEntity;
  @Column({ default: '' })
  fmt: string;
  @Column()
  publicKey: string;
  @Column()
  counter: string;
  @Column()
  credID: string;
}
