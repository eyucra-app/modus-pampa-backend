import { MigrationInterface, QueryRunner } from "typeorm";

export class FixContributionUuidColumn1750974422217 implements MigrationInterface {
    name = 'FixContributionUuidColumn1750974422217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "contribution_uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "contribution_uuid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "PK_58242e703a34e73f6cfe1a6df52"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "uuid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "PK_58242e703a34e73f6cfe1a6df52" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6" FOREIGN KEY ("contribution_uuid") REFERENCES "contributions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "PK_58242e703a34e73f6cfe1a6df52"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "uuid" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "PK_58242e703a34e73f6cfe1a6df52" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "contribution_uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "contribution_uuid" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6" FOREIGN KEY ("contribution_uuid") REFERENCES "contributions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
