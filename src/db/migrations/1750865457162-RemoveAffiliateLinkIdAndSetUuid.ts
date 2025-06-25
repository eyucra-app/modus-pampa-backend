import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveAffiliateLinkIdAndSetUuid1750865457162 implements MigrationInterface {
    name = 'RemoveAffiliateLinkIdAndSetUuid1750865457162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "PK_ca2b4f39eb9e32a61278c711f79"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "UQ_58242e703a34e73f6cfe1a6df52"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "uuid" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "PK_58242e703a34e73f6cfe1a6df52" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "contribution_uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "contribution_uuid" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6" FOREIGN KEY ("contribution_uuid") REFERENCES "contributions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "contribution_uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "contribution_uuid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "PK_58242e703a34e73f6cfe1a6df52"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "uuid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "UQ_58242e703a34e73f6cfe1a6df52" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6" FOREIGN KEY ("contribution_uuid") REFERENCES "contributions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "PK_ca2b4f39eb9e32a61278c711f79" PRIMARY KEY ("id")`);
    }

}
