import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateConfigurationModule1751254360055 implements MigrationInterface {
    name = 'CreateConfigurationModule1751254360055'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "configurations" ("id" integer NOT NULL DEFAULT '1', "monto_multa_retraso" double precision DEFAULT '5', "monto_multa_falta" double precision DEFAULT '20', "backend_url" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ef9fc29709cc5fc66610fc6a664" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "configurations"`);
    }

}
