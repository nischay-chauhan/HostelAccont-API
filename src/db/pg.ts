import { Client } from 'pg';

export function getClient(): Client {
    const config = {
        user: process.env.PG_USER || '', 
        password: process.env.PG_PASSWORD || '', 
        host: process.env.PG_HOST || '', 
        port: parseInt(process.env.PG_PORT || '0'), 
        database: process.env.PG_DATABASE || '', 
        ssl: {
            rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED === 'true',
            ca: process.env.PG_SSL_CA || '', 
        },
    };
    const client = new Client(config);
    return client;
}
