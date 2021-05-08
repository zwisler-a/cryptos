import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('test')
  public test() {
    return 'test';
  }
}
