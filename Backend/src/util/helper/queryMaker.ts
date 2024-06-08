import pool from "../../lib/database/db";

export async function createMany(table: string, data: any) {
  const keys = Object.keys(data);
  const result = keys.join(", ");
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(", ");
  const values = Object.values(data);
  const query = `
    INSERT INTO ${table} (
      ${result}
    ) VALUES (${placeholders}) RETURNING *;
  `;
  const { rows } = await pool.query(query, values);
  return rows[0];
}
