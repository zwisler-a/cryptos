import { EntityRepository, Repository } from 'typeorm';

import { BalanceEntitiy } from '../balance.entity';

@EntityRepository(BalanceEntitiy)
export class BalanceRepository extends Repository<BalanceEntitiy> {}
