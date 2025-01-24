import { Client } from 'pg';

export function getClient(): Client {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is not defined in environment variables');
    }
    
    const client = new Client({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: false
        } : undefined
    });
    
    return client;
}
