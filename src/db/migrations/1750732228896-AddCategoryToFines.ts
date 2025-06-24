import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryToFines1750732228896 implements MigrationInterface {
    name = 'AddCategoryToFines1750732228896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" ADD "category" character varying NOT NULL DEFAULT 'Varios'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "category"`);
    }

}
