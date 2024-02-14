import express from "express";
import { Client, QueryResult } from "pg";
import { getClient } from "./db/pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const PORT = 8000 || process.env.PORT;

const client: Client = getClient();

client.connect(function (err: Error) {
    if (err)
        throw err;
    client.query("SELECT VERSION()", [], function (err: Error, result: QueryResult) {
        if (err)
            throw err;

        console.log(result.rows[0].version);
        client.end(function (err: Error) {
            if (err)
                throw err;
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
