import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ExternalApiService } from './services/external-api.service';
import { AbsensiApiService } from './services/absensi-api.service';
import { BellApiService } from './services/bell-api.service';

@Module({
  imports: [HttpModule],
  providers: [ExternalApiService, AbsensiApiService, BellApiService],
  exports: [ExternalApiService, AbsensiApiService, BellApiService],
})
export class WebhookModule {}