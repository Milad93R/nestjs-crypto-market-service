import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1738918284045 implements MigrationInterface {
    name = 'InitialSchema1738918284045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "exchanges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, CONSTRAINT "UQ_5645e6d42aec6335aeaf1c41c09" UNIQUE ("name"), CONSTRAINT "PK_17ccd29473f939c68de98c2cea3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "timeframes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "interval" character varying NOT NULL, "minutes" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8fa535701f97b70c2b7e4923f9a" UNIQUE ("name"), CONSTRAINT "UQ_10b93866ab2010e5496bf2383f1" UNIQUE ("interval"), CONSTRAINT "PK_93287fe0e7cd4f7d0c4dab6f146" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."coin_exchanges_markettype_enum" AS ENUM('spot', 'perpetual')`);
        await queryRunner.query(`CREATE TABLE "coin_exchanges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "marketType" "public"."coin_exchanges_markettype_enum" NOT NULL DEFAULT 'spot', "isActive" boolean NOT NULL DEFAULT true, "status" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "coin_id" uuid, "exchange_id" uuid, "timeframe_id" uuid, CONSTRAINT "PK_080a1eedf54a014104b979a90c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "coins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "symbol" character varying NOT NULL, CONSTRAINT "UQ_c3e2eaf8718a5b3e5f56f50debb" UNIQUE ("symbol"), CONSTRAINT "PK_af01e5dcef2c05e6385611205c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "candles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "coin_exchange_id" uuid NOT NULL, "interval" character varying(10) NOT NULL, "open" numeric(20,8) NOT NULL, "high" numeric(20,8) NOT NULL, "low" numeric(20,8) NOT NULL, "close" numeric(20,8) NOT NULL, "volume" numeric(20,8) NOT NULL, "timestamp" TIMESTAMP NOT NULL, CONSTRAINT "PK_51487d0946f705bd3df19d2f04e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a71d490fb10f250a73d625481b" ON "candles" ("coin_exchange_id", "timestamp") `);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" ADD CONSTRAINT "FK_ee9611184ea352f60dacb5fa74a" FOREIGN KEY ("coin_id") REFERENCES "coins"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" ADD CONSTRAINT "FK_24e0d4975d573020bb279e11c52" FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" ADD CONSTRAINT "FK_b269266642bbf3932082133a1f4" FOREIGN KEY ("timeframe_id") REFERENCES "timeframes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candles" ADD CONSTRAINT "FK_8d15e71c84075562d0ee1cc4be9" FOREIGN KEY ("coin_exchange_id") REFERENCES "coin_exchanges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "candles" DROP CONSTRAINT "FK_8d15e71c84075562d0ee1cc4be9"`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" DROP CONSTRAINT "FK_b269266642bbf3932082133a1f4"`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" DROP CONSTRAINT "FK_24e0d4975d573020bb279e11c52"`);
        await queryRunner.query(`ALTER TABLE "coin_exchanges" DROP CONSTRAINT "FK_ee9611184ea352f60dacb5fa74a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a71d490fb10f250a73d625481b"`);
        await queryRunner.query(`DROP TABLE "candles"`);
        await queryRunner.query(`DROP TABLE "coins"`);
        await queryRunner.query(`DROP TABLE "coin_exchanges"`);
        await queryRunner.query(`DROP TYPE "public"."coin_exchanges_markettype_enum"`);
        await queryRunner.query(`DROP TABLE "timeframes"`);
        await queryRunner.query(`DROP TABLE "exchanges"`);
    }

}
