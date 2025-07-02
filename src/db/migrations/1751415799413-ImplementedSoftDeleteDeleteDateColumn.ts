import { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementedSoftDeleteDeleteDateColumn1751415799413 implements MigrationInterface {
    name = 'ImplementedSoftDeleteDeleteDateColumn1751415799413'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "affiliates" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "affiliates" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
    }

}
