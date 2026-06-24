const pool = require("./db");

async function seed() {
  try {
    console.log("Generating 200,000 products...");

    await pool.query(`
      INSERT INTO products
      (name, category, price, created_at, updated_at)

      SELECT
        'Product ' || gs,

        'Category ' || ((random() * 9)::int),

        ROUND((random() * 1000)::numeric, 2),

        NOW() - (random() * 365 || ' days')::interval,

        NOW() - (random() * 365 || ' days')::interval

      FROM generate_series(1, 200000) gs;
    `);

    console.log("Seed completed!");

    process.exit(0);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();