import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorFinesStatusToIsPaid1750729429986 implements MigrationInterface {
    name = 'RefactorFinesStatusToIsPaid1750729429986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" RENAME COLUMN "status" TO "is_paid"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "is_paid"`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "is_paid" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "is_paid"`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "is_paid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fines" RENAME COLUMN "is_paid" TO "status"`);
    }

}
