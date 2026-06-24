const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("Database Connected!");
    console.log(result.rows[0]);

    process.exit(0);

  } catch (error) {

    console.error("Connection Failed");
    console.error(error);

    process.exit(1);
  }
}

testConnection();