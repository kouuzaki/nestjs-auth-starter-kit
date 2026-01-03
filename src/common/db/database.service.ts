import { Logger, Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { config as appConfig } from '@/config/loader';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name, { timestamp: true });
    private pool: Pool;
    private _db: NodePgDatabase<typeof schema>;
    private isConnected = false;

    constructor() {
        this.logger.log('Initializing database service...');
        
        try {
            this.pool = new Pool({
                database: appConfig.database.database,
                user: appConfig.database.user,
                password: appConfig.database.password,
                host: appConfig.database.host,
                port: appConfig.database.port,
            });

            // Setup pool error handlers
            this.pool.on('error', (err) => {
                this.logger.error(`Database pool error: ${err.message}`, err.stack);
                this.isConnected = false;
            });

            this._db = drizzle(this.pool, { schema });
        } catch (error) {
            this.logger.error(`Failed to initialize database pool: ${error.message}`, error.stack);
            throw error;
        }
    }

    async onModuleInit() {
        try {
            // Test the connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isConnected = true;
            this.logger.log(`✓ Database connected to ${appConfig.database.host}:${appConfig.database.port}/${appConfig.database.database}`);
        } catch (error) {
            this.isConnected = false;
            this.logger.error(
                `✗ Failed to connect to database at ${appConfig.database.host}:${appConfig.database.port}/${appConfig.database.database}. Error: ${error.message}`,
                error.stack
            );
            throw error;
        }
    }

    get db(): NodePgDatabase<typeof schema> {
        if (!this.isConnected) {
            this.logger.warn('Database is not connected. Operation may fail.');
        }
        return this._db;
    }

    isDatabaseConnected(): boolean {
        return this.isConnected;
    }

    async onModuleDestroy() {
        try {
            this.logger.log('Closing database connection...');
            await this.pool.end();
            this.isConnected = false;
            this.logger.log('✓ Database connection closed successfully');
        } catch (error) {
            this.logger.error(`Error closing database connection: ${error.message}`, error.stack);
        }
    }
}