import { Controller, Get, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('pull')
  pullChanges(@Query('lastSync') lastSync?: string) {
    // El timestamp vendrá como un string en formato ISO 8601 desde Flutter
    return this.syncService.pullChanges(lastSync);
  }
}