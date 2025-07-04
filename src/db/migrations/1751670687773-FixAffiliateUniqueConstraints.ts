import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAffiliateUniqueConstraints1751670687773 implements MigrationInterface {
    name = 'FixAffiliateUniqueConstraints1751670687773'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Eliminamos las viejas restricciones UNIQUE de la tabla completa.
        await queryRunner.query(`ALTER TABLE "affiliates" DROP CONSTRAINT "UQ_5458bf988fb83086da3a14b9ff9"`);
        await queryRunner.query(`ALTER TABLE "affiliates" DROP CONSTRAINT "UQ_c82eb939abbc090ef9c820f2df8"`);

        // 2. Creamos los nuevos índices únicos PARCIALES, que solo se aplican
        //    a las filas donde 'deleted_at' es nulo.
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_affiliate_id_not_deleted" ON "affiliates" ("id") WHERE "deleted_at" IS NULL`
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_affiliate_ci_not_deleted" ON "affiliates" ("ci") WHERE "deleted_at" IS NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Lógica para REVERTIR los cambios en caso de ser necesario ---

        // 1. Eliminar los nuevos índices parciales que creamos en 'up'.
        await queryRunner.query(`DROP INDEX "public"."IDX_affiliate_id_not_deleted"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_affiliate_ci_not_deleted"`);

        // 2. Volver a crear las viejas restricciones UNIQUE.
        await queryRunner.query(`ALTER TABLE "affiliates" ADD CONSTRAINT "UQ_5458bf988fb83086da3a14b9ff9" UNIQUE ("id")`);
        await queryRunner.query(`ALTER TABLE "affiliates" ADD CONSTRAINT "UQ_c82eb939abbc090ef9c820f2df8" UNIQUE ("ci")`);
    }
}