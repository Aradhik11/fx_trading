import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
});

async function checkSchema() {
    await dataSource.initialize();

    try {
        // Get all tables
        const tables = await dataSource.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('\nTables in database:');
        console.log(tables);

        // Get enum types
        const enums = await dataSource.query(`
            SELECT t.typname, e.enumlabel
            FROM pg_type t 
            JOIN pg_enum e ON t.oid = e.enumtypid  
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
            ORDER BY t.typname, e.enumsortorder;
        `);
        console.log('\nEnum types in database:');
        console.log(enums);

        // Get columns of transactions table
        const columns = await dataSource.query(`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name = 'transactions';
        `);
        console.log('\nColumns in transactions table:');
        console.log(columns);

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await dataSource.destroy();
    }
}

checkSchema(); 