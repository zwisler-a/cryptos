import { applyDecorators, UseGuards } from '@nestjs/common';

import { WsJwtGuard } from './ws-jwt.guard';

export function Secured() {
  return applyDecorators(
      UseGuards(WsJwtGuard)
    );
}
