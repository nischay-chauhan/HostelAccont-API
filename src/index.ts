import express from "express";
import { Client, QueryResult } from "pg";
import { getClient } from "./db/pg";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import studentRouter from "./routes/user.route";
import inchargeRouter from "./routes/incharge.route";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { logger } from "./utils/logger";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    pinoHttp({
        logger,
        genReqId: function genReqId(req, res) {
            const existingId =
                (req as any).id || req.headers["x-request-id"] || randomUUID();
            (req as any).id = existingId;
            (res as any).setHeader("x-request-id", existingId as string);
            return existingId as string;
        },
        autoLogging: true,
        customProps: function customProps(req, res) {
            return {
                requestId: (req as any).id,
            };
        },
    })
);

const PORT = process.env.PORT || 8000;

const client: Client = getClient();

async function startServer() {
    try {
        await client.connect();
        logger.info("Connected to PostgreSQL database");
        
        app.use("/api/v1/student" , studentRouter);
        app.use("/api/v1/incharge" , inchargeRouter);

        app.listen(PORT, () => {
            logger.info({ port: PORT }, "Server is running");
        });
    } catch (error) {
        logger.error({ err: error }, "Failed to connect to the database");
        process.exit(1);
    }
}

startServer();

// Handle cleanup on app shutdown
process.on('SIGTERM', () => {
    client.end();
    process.exit(0);
});
