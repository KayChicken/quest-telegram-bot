import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigrationSQL1693770000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "chatID" BIGINT PRIMARY KEY,
                "email" VARCHAR(255) NOT NULL,
                "username" VARCHAR(255) NOT NULL,
                "stage_9_score" INT DEFAULT 0,
                "stage" VARCHAR(255) NOT NULL,
		 		"created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

    await queryRunner.query(`
            CREATE INDEX "chatID_index" ON "users" ("chatID");
        `);

    await queryRunner.query(`
            CREATE TABLE "reminder" (
                "id" SERIAL PRIMARY KEY,
                "chatID" BIGINT NOT NULL,
                "message" TEXT NOT NULL,
                "sendAt" TIMESTAMP NOT NULL,
                "replyMarkup" JSONB,
                "isSent" BOOLEAN DEFAULT FALSE
            );
        `);

    await queryRunner.query(`
            CREATE INDEX "chatID_index_reminder" ON "reminder" ("chatID");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "chatID_index";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "chatID_index_reminder";`);

    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "reminder";`);
  }
}
