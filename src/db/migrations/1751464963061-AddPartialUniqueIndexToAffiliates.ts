import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartialUniqueIndexToAffiliates1678886400000 implements MigrationInterface {
    name = 'AddPartialUniqueIndexToAffiliates1678886400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Índice único para 'id' donde deleted_at es NULL
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_affiliate_id_not_deleted" ON "affiliates" ("id") WHERE "deleted_at" IS NULL`
        );
        // Índice único para 'ci' donde deleted_at es NULL
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_affiliate_ci_not_deleted" ON "affiliates" ("ci") WHERE "deleted_at" IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_affiliate_id_not_deleted"`);
        await queryRunner.query(`DROP INDEX "IDX_affiliate_ci_not_deleted"`);
    }
}