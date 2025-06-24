import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorContributionLinks1750807329215 implements MigrationInterface {
    name = 'RefactorContributionLinks1750807329215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_abf40ae626102852f787b92ff98"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "PK_4be2e71a3e998b97dbb9c201313"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "PK_0ca270b206e0d8410505438f97a" PRIMARY KEY ("affiliate_uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "contributionId"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "uuid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "PK_0ca270b206e0d8410505438f97a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "PK_740c68f107fac6c0feaea704d9a" PRIMARY KEY ("affiliate_uuid", "uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "contribution_uuid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_0ca270b206e0d8410505438f97a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "PK_740c68f107fac6c0feaea704d9a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "PK_70784c35aa5c839653a3ec94c43" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6" FOREIGN KEY ("contribution_uuid") REFERENCES "contributions"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_0ca270b206e0d8410505438f97a" FOREIGN KEY ("affiliate_uuid") REFERENCES "affiliates"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_0ca270b206e0d8410505438f97a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_5b3cabde214bda39dc07ac805a6"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "PK_70784c35aa5c839653a3ec94c43"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "PK_740c68f107fac6c0feaea704d9a" PRIMARY KEY ("affiliate_uuid", "uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_0ca270b206e0d8410505438f97a" FOREIGN KEY ("affiliate_uuid") REFERENCES "affiliates"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "contribution_uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "PK_740c68f107fac6c0feaea704d9a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "PK_0ca270b206e0d8410505438f97a" PRIMARY KEY ("affiliate_uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD "contributionId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "PK_0ca270b206e0d8410505438f97a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "PK_4be2e71a3e998b97dbb9c201313" PRIMARY KEY ("contributionId", "affiliate_uuid")`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_abf40ae626102852f787b92ff98" FOREIGN KEY ("contributionId") REFERENCES "contributions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
