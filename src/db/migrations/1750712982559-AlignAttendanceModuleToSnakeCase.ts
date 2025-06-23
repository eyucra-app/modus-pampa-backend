import { MigrationInterface, QueryRunner } from "typeorm";

export class AlignAttendanceModuleToSnakeCase1750712982559 implements MigrationInterface {
    name = 'AlignAttendanceModuleToSnakeCase1750712982559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP CONSTRAINT "FK_c0bb820007004bf71c76df4d189"`);
        await queryRunner.query(`ALTER TABLE "fines" RENAME COLUMN "affiliateId" TO "affiliate_uuid"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "fines" ADD CONSTRAINT "FK_4284c91a98664838be246a13c5f" FOREIGN KEY ("affiliate_uuid") REFERENCES "affiliates"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP CONSTRAINT "FK_4284c91a98664838be246a13c5f"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "fines" RENAME COLUMN "affiliate_uuid" TO "affiliateId"`);
        await queryRunner.query(`ALTER TABLE "fines" ADD CONSTRAINT "FK_c0bb820007004bf71c76df4d189" FOREIGN KEY ("affiliateId") REFERENCES "affiliates"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
