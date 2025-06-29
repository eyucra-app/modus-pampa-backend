import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountPaidToFines1751161223034 implements MigrationInterface {
    name = 'AddAmountPaidToFines1751161223034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" ADD "amount_paid" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "amount_paid"`);
    }

}
