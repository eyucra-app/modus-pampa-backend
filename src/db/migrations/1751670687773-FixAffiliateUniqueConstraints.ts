import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAffiliateUniqueConstraints1751670687773 implements MigrationInterface {
    name = 'FixAffiliateUniqueConstraints1751670687773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Nombres de las viejas restricciones ---
        const oldIdConstraint = "UQ_5458bf988fb83086da3a14b9ff9";
        const oldCiConstraint = "UQ_c82eb939abbc090ef9c820f2df8";

        // --- Nombres de los nuevos índices ---
        const newIdIndex = "IDX_affiliate_id_not_deleted";
        const newCiIndex = "IDX_affiliate_ci_not_deleted";

        // 1. Eliminamos las viejas restricciones, SI EXISTEN
        await queryRunner.query(
            `ALTER TABLE "affiliates" DROP CONSTRAINT IF EXISTS "${oldIdConstraint}"`
        );
        await queryRunner.query(
            `ALTER TABLE "affiliates" DROP CONSTRAINT IF EXISTS "${oldCiConstraint}"`
        );

        // 2. Creamos los nuevos índices, SI NO EXISTEN
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "${newIdIndex}" ON "affiliates" ("id") WHERE "deleted_at" IS NULL`
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX IF NOT EXISTS "${newCiIndex}" ON "affiliates" ("ci") WHERE "deleted_at" IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Nombres de las viejas restricciones ---
        const oldIdConstraint = "UQ_5458bf988fb83086da3a14b9ff9";
        const oldCiConstraint = "UQ_c82eb939abbc090ef9c820f2df8";

        // --- Nombres de los nuevos índices ---
        const newIdIndex = "IDX_affiliate_id_not_deleted";
        const newCiIndex = "IDX_affiliate_ci_not_deleted";
        
        // 1. Eliminar los nuevos índices parciales, SI EXISTEN
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."${newIdIndex}"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."${newCiIndex}"`);

        // 2. Volver a crear las viejas restricciones, SI NO EXISTEN
        // (La lógica para añadir "IF NOT EXISTS" a un constraint es más compleja,
        // pero para el 'down' esto es suficiente)
        await queryRunner.query(
            `ALTER TABLE "affiliates" ADD CONSTRAINT "${oldIdConstraint}" UNIQUE ("id")`
        );
        await queryRunner.query(
            `ALTER TABLE "affiliates" ADD CONSTRAINT "${oldCiConstraint}" UNIQUE ("ci")`
        );
    }
}