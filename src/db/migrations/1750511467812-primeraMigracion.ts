import { MigrationInterface, QueryRunner } from "typeorm";

export class PrimeraMigracion1750511467812 implements MigrationInterface {
    name = 'PrimeraMigracion1750511467812'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_0ca270b206e0d8410505438f97a"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" RENAME COLUMN "affiliate_uuid" TO "affiliateUuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" RENAME CONSTRAINT "PK_4be2e71a3e998b97dbb9c201313" TO "PK_2e780bdd88ef6263384583a94cf"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" RENAME COLUMN "updated_at" TO "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "user_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "affiliates" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "affiliates" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP CONSTRAINT "UQ_58242e703a34e73f6cfe1a6df52"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "username" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "affiliates" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "affiliates" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "affiliates" ALTER COLUMN "tags" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_a67f5172ad2dc91601b6f1eacb0" FOREIGN KEY ("affiliateUuid") REFERENCES "affiliates"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" DROP CONSTRAINT "FK_a67f5172ad2dc91601b6f1eacb0"`);
        await queryRunner.query(`ALTER TABLE "affiliates" ALTER COLUMN "tags" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "contributions" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "fines" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "affiliates" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "affiliates" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD "uuid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contributions" ADD CONSTRAINT "UQ_58242e703a34e73f6cfe1a6df52" UNIQUE ("uuid")`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "fines" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "affiliates" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "affiliates" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "user_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_074a1f262efaca6aba16f7ed920" UNIQUE ("user_name")`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" RENAME COLUMN "updatedAt" TO "updated_at"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" RENAME CONSTRAINT "PK_2e780bdd88ef6263384583a94cf" TO "PK_4be2e71a3e998b97dbb9c201313"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" RENAME COLUMN "affiliateUuid" TO "affiliate_uuid"`);
        await queryRunner.query(`ALTER TABLE "contribution_affiliates" ADD CONSTRAINT "FK_0ca270b206e0d8410505438f97a" FOREIGN KEY ("affiliate_uuid") REFERENCES "affiliates"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
