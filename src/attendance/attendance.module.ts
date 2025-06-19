import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AttendanceListEntity } from './entities/attendance-list.entity';
import { AttendanceRecordEntity } from './entities/attendance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceListEntity,
      AttendanceRecordEntity,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}