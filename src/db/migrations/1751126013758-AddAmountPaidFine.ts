import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountPaidFine1751126013758 implements MigrationInterface {
    name = 'AddAmountPaidFine1751126013758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" ADD "amount_paid" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "amount_paid"`);
    }

}
