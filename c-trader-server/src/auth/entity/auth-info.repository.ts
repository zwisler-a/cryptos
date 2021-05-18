import { EntityRepository, Repository } from 'typeorm';

import { AuthInfos } from './auth-info.entity';

@EntityRepository(AuthInfos)
export class AuthInfoRepository extends Repository<AuthInfos> {}
