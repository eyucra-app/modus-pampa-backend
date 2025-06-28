import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRelatedAttendanceUuidToFines1751124401019 implements MigrationInterface {
    name = 'AddRelatedAttendanceUuidToFines1751124401019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" ADD "related_attendance_uuid" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "related_attendance_uuid"`);
    }

}
