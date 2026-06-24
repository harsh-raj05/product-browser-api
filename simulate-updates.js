const pool = require("./db");

async function simulateUpdates() {
  try {

    console.log("Adding 50 new products...");

    await pool.query(`
      INSERT INTO products
      (name, category, price, created_at, updated_at)

      SELECT
        'NEW Product ' || gs,

        'Category ' || ((random() * 9)::int),

        ROUND((random() * 1000)::numeric, 2),

        NOW(),
        NOW()

      FROM generate_series(1,50) gs
    `);

    console.log("50 products inserted");

    process.exit(0);

  } catch (err) {

    console.error(err);

    process.exit(1);
  }
}

simulateUpdates();