import { EntityRepository, Repository } from 'typeorm';

import { TickerEntity } from '../ticker.entity';

@EntityRepository(TickerEntity)
export class TickerRepository extends Repository<TickerEntity> {}
