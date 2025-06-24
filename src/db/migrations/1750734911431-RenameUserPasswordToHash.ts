import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUserPasswordToHash1750734911431 implements MigrationInterface {
    name = 'RenameUserPasswordToHash1750734911431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password"`);
    }

}
