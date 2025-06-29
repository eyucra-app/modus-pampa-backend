import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountPaidNullableFineRename1751158960995 implements MigrationInterface {
    name = 'AddAmountPaidNullableFineRename1751158960995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" ADD "amount_paido" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "amount_paido"`);
    }

}
