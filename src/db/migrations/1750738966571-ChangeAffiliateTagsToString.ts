import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAffiliateTagsToString1750738966571 implements MigrationInterface {
    name = 'ChangeAffiliateTagsToString1750738966571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliates" ALTER COLUMN "tags" SET DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "affiliates" ALTER COLUMN "tags" DROP DEFAULT`);
    }

}
