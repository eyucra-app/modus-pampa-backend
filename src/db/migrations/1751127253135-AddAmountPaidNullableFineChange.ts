import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountPaidNullableFineChange1751127253135 implements MigrationInterface {
    name = 'AddAmountPaidNullableFineChange1751127253135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" ADD "amount_paid" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "amount_paid"`);
    }

}
