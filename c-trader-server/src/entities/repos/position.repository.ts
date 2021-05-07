import { EntityRepository, Repository } from 'typeorm';

import { PositionEntity } from '../position.entity';

@EntityRepository(PositionEntity)
export class PositionRepository extends Repository<PositionEntity> {}
