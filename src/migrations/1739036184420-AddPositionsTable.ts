import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPositionsTable1739036184420 implements MigrationInterface {
    name = 'AddPositionsTable1739036184420'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types
        await queryRunner.query(`CREATE TYPE "public"."position_type_enum" AS ENUM('long', 'short')`);
        await queryRunner.query(`CREATE TYPE "public"."position_status_enum" AS ENUM('open', 'closed')`);
        await queryRunner.query(`CREATE TYPE "public"."position_stop_loss_reason_enum" AS ENUM('price_target', 'trailing_stop', 'time_based', 'volatility', 'manual', 'technical_indicator', 'risk_management', 'other')`);
        
        // Create positions table
        await queryRunner.query(`
            CREATE TABLE "positions" (
                "id" SERIAL NOT NULL,
                "coin_exchange_id" integer NOT NULL,
                "type" "public"."position_type_enum" NOT NULL DEFAULT 'long',
                "status" "public"."position_status_enum" NOT NULL DEFAULT 'open',
                "entryPrice" numeric(20,8) NOT NULL,
                "exitPrice" numeric(20,8),
                "quantity" numeric(20,8) NOT NULL,
                "stopLoss" numeric(20,8),
                "takeProfit" numeric(20,8),
                "stop_loss_reason" "public"."position_stop_loss_reason_enum",
                "stop_loss_details" text,
                "closedAt" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_positions_id" PRIMARY KEY ("id")
            )
        `);
        
        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "positions" 
            ADD CONSTRAINT "FK_positions_coin_exchange" 
            FOREIGN KEY ("coin_exchange_id") 
            REFERENCES "coin_exchange"("id") 
            ON DELETE NO ACTION 
            ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_positions_coin_exchange"`);
        
        // Drop positions table
        await queryRunner.query(`DROP TABLE "positions"`);
        
        // Drop enum types
        await queryRunner.query(`DROP TYPE "public"."position_stop_loss_reason_enum"`);
        await queryRunner.query(`DROP TYPE "public"."position_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."position_type_enum"`);
    }
} 