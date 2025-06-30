import { MigrationInterface, QueryRunner } from "typeorm";

export class DropColumnConfigurationModule1751282384600 implements MigrationInterface {
    name = 'DropColumnConfigurationModule1751282384600'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configurations" DROP COLUMN "backend_url"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "configurations" ADD "backend_url" character varying`);
    }

}
