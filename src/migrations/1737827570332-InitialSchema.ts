import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1737827570332 implements MigrationInterface {
    name = 'InitialSchema1737827570332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exchanges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, CONSTRAINT "UQ_5645e6d42aec6335aeaf1c41c09" UNIQUE ("name"), CONSTRAINT "PK_17ccd29473f939c68de98c2cea3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coin_exchanges_exchange_status_enum" AS ENUM('active', 'inactive', 'delisted')`);
        await queryRunner.query(`CREATE TABLE "coin_exchanges" ("coin_id" uuid NOT NULL, "exchange_id" uuid NOT NULL, "exchange_status" "public"."coin_exchanges_exchange_status_enum" NOT NULL DEFAULT 'active', CONSTRAINT "PK_534652fecb1bbafc1868c938e0a" PRIMARY KEY ("coin_id", "exchange_id"))`);
        await queryRunner.query(`CREATE TABLE "coins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "symbol" character varying(20) NOT NULL, CONSTRAINT "UQ_d4dbd2e22991a2d052634850eb8" UNIQUE ("name"), CONSTRAINT "UQ_c3e2eaf8718a5b3e5f56f50debb" UNIQUE ("symbol"), CONSTRAINT "PK_af01e5dcef2c05e6385611205c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "candles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "coin_id" uuid NOT NULL, "exchange_id" uuid NOT NULL, "interval" character varying(10) NOT NULL, "open" numeric(20,8) NOT NULL, "high" numeric(20,8) NOT NULL, "low" numeric(20,8) NOT NULL, "close" numeric(20,8) NOT NULL, "volume" numeric(20,8) NOT NULL, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "PK_51487d0946f705bd3df19d2f04e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_33a91ea28ff32563811f0753fa" ON "candles" ("coin_id", "exchange_id", "timestamp") `);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" ADD CONSTRAINT "FK_ee9611184ea352f60dacb5fa74a" FOREIGN KEY ("coin_id") REFERENCES "coins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" ADD CONSTRAINT "FK_24e0d4975d573020bb279e11c52" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candles" ADD CONSTRAINT "FK_05cce3c25c4e6b9083f2e7eba4c" FOREIGN KEY ("coin_id") REFERENCES "coins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candles" ADD CONSTRAINT "FK_edcad79d1a1b7527a29b71b97b3" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "candles" DROP CONSTRAINT "FK_edcad79d1a1b7527a29b71b97b3"`);
        await queryRunner.query(`ALTER TABLE "candles" DROP CONSTRAINT "FK_05cce3c25c4e6b9083f2e7eba4c"`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" DROP CONSTRAINT "FK_24e0d4975d573020bb279e11c52"`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" DROP CONSTRAINT "FK_ee9611184ea352f60dacb5fa74a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_33a91ea28ff32563811f0753fa"`);
        await queryRunner.query(`DROP TABLE "candles"`);
        await queryRunner.query(`DROP TABLE "coins"`);
        await queryRunner.query(`DROP TABLE "coin_exchanges"`);
        await queryRunner.query(`DROP TYPE "public"."coin_exchanges_exchange_status_enum"`);
        await queryRunner.query(`DROP TABLE "exchanges"`);
    }

}
