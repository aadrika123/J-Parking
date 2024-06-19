import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});


async function connectWithRetry() {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await pool.connect();
      console.log("Database connected successfully");
      return;
    } catch (error) {
      retries++;
      console.log(
        `Retrying to connect to the database (${retries}/${maxRetries})...`
      );
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  throw new Error("Failed to connect to the database after several attempts");
}

connectWithRetry();

export default pool;
