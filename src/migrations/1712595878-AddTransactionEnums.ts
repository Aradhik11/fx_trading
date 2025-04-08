import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionEnums1712595878 implements MigrationInterface {
    name = 'AddTransactionEnums1712595878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the enum types
        await queryRunner.query(`
            CREATE TYPE "transaction_type_enum" AS ENUM ('FUNDING', 'CONVERSION', 'TRADE');
            CREATE TYPE "transaction_status_enum" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
        `);

        // Temporarily alter the type column to varchar
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ALTER COLUMN "type" TYPE VARCHAR(255),
            ALTER COLUMN "status" TYPE VARCHAR(255);
        `);

        // Convert existing values to uppercase
        await queryRunner.query(`
            UPDATE "transactions" 
            SET type = UPPER(type),
                status = UPPER(status);
        `);

        // Alter the columns to use the enum types
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ALTER COLUMN "type" TYPE "transaction_type_enum" USING type::transaction_type_enum,
            ALTER COLUMN "status" TYPE "transaction_status_enum" USING status::transaction_status_enum;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Convert enum columns back to varchar
        await queryRunner.query(`
            ALTER TABLE "transactions" 
            ALTER COLUMN "type" TYPE VARCHAR(255),
            ALTER COLUMN "status" TYPE VARCHAR(255);
        `);

        // Drop the enum types
        await queryRunner.query(`
            DROP TYPE "transaction_type_enum";
            DROP TYPE "transaction_status_enum";
        `);
    }
} 