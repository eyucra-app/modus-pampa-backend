import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorizeAttendanceModule1751120521370 implements MigrationInterface {
    name = 'RefactorizeAttendanceModule1751120521370'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "FK_a34012bccda34e01205756a29f9"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" RENAME COLUMN "id" TO "uuid"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" RENAME CONSTRAINT "PK_d6b19710207ca936b12935aa8dc" TO "PK_83aa2ded0068b05a304265615a9"`);
        await queryRunner.query(`ALTER SEQUENCE "attendance_lists_id_seq" RENAME TO "attendance_lists_uuid_seq"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "PK_946920332f5bc9efad3f3023b96"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "list_id"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "uuid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "PK_3467354070cd3601dbc464705a4" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "list_uuid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" DROP CONSTRAINT "PK_83aa2ded0068b05a304265615a9"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" ADD "uuid" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" ADD CONSTRAINT "PK_83aa2ded0068b05a304265615a9" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "FK_0f2be6a3f1da6bc37bdd59d0512" FOREIGN KEY ("list_uuid") REFERENCES "attendance_lists"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "FK_0f2be6a3f1da6bc37bdd59d0512"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" DROP CONSTRAINT "PK_83aa2ded0068b05a304265615a9"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" ADD "uuid" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" ADD CONSTRAINT "PK_83aa2ded0068b05a304265615a9" PRIMARY KEY ("uuid")`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "list_uuid"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP CONSTRAINT "PK_3467354070cd3601dbc464705a4"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" DROP COLUMN "uuid"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "list_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "PK_946920332f5bc9efad3f3023b96" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER SEQUENCE "attendance_lists_uuid_seq" RENAME TO "attendance_lists_id_seq"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" RENAME CONSTRAINT "PK_83aa2ded0068b05a304265615a9" TO "PK_d6b19710207ca936b12935aa8dc"`);
        await queryRunner.query(`ALTER TABLE "attendance_lists" RENAME COLUMN "uuid" TO "id"`);
        await queryRunner.query(`ALTER TABLE "attendance_records" ADD CONSTRAINT "FK_a34012bccda34e01205756a29f9" FOREIGN KEY ("list_id") REFERENCES "attendance_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
