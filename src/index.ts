import express from "express";
import { Client, QueryResult } from "pg";
import { getClient } from "./db/pg";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import studentRouter from "./routes/user.route";
import inchargeRouter from "./routes/incharge.route"
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

const PORT = process.env.PORT || 8000;

const client: Client = getClient();

async function startServer() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database');
        
        app.use("/api/v1/student" , studentRouter);
        app.use("/api/v1/incharge" , inchargeRouter);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}

startServer();

// Handle cleanup on app shutdown
process.on('SIGTERM', () => {
    client.end();
    process.exit(0);
});
