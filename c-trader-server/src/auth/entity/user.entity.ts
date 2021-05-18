import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AuthInfos } from './auth-info.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  username: string;
  @Column()
  password: string;
  @Column({ default: '' })
  challenge: string;
  @OneToMany(() => AuthInfos, (a) => a.user)
  authInfos: AuthInfos[];
}
