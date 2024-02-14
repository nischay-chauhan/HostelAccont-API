import express from "express";
import { Client, QueryResult } from "pg";
import { getClient } from "./db/pg";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
import studentRouter from "./routes/user.route";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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

app.use("/api/v1/student" , studentRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
