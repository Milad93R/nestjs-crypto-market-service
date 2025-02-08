import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCandleVolumeDecimal1739036184419 implements MigrationInterface {
    name = 'UpdateCandleVolumeDecimal1739036184419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "candles" ALTER COLUMN "volume" TYPE numeric(30,8)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "candles" ALTER COLUMN "volume" TYPE numeric(20,8)`);
    }

}
