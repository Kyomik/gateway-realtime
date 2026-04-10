import { Controller, Get, Param, HttpCode } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('awesome')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('oke')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':id')
  @HttpCode(202)
  findOne(@Param() params: any): string {
    return `This action returns a #${params.id} cat`;
  }
}
