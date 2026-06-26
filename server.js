require("dotenv").config();

const express = require("express");
const pool = require("./db");

const app = express();

app.use(express.json());

function encodeCursor(product) {
  return Buffer.from(
    JSON.stringify({
      updated_at: product.updated_at,
      id: product.id
    })
  ).toString("base64");
}

function decodeCursor(cursor) {
  return JSON.parse(
    Buffer.from(cursor, "base64").toString()
  );
}

app.get("/", (req, res) => {
  res.send("Product Browser API Running");
});

app.get("/test-cursor", (req, res) => {

  const product = {
    id: 123,
    updated_at: "2026-06-23T10:00:00.000Z"
  };

  const cursor = encodeCursor(product);

  const decoded = decodeCursor(cursor);

  res.json({
    cursor,
    decoded
  });
});

app.get("/products", async (req, res) => {

    const limit = Math.min(
        Number(req.query.limit) || 20,
        100
    );

  try {

    let snapshotTime =
      req.query.snapshot_time;

    if (!snapshotTime) {
      snapshotTime =
        new Date().toISOString();
    }

    const cursor =
      req.query.cursor;
    const category = 
      req.query.category;

    let values = [snapshotTime];

    let sql = `
      SELECT *
      FROM products
      WHERE updated_at <= $1
    `;

    if (category) {

        values.push(category);

        sql += `
            AND category = $${values.length}
        `;
    }

    if (cursor) {

        const decoded =
            decodeCursor(cursor);

        values.push(decoded.updated_at);
        values.push(decoded.id);

        sql += `
            AND (updated_at, id)
            <
            ($${values.length - 1},
            $${values.length})
        `;
    }

    values.push(limit);

    sql += `
    ORDER BY updated_at DESC,
            id DESC
    LIMIT $${values.length}
    `;

    const result =
      await pool.query(sql, values);

    const products =
      result.rows;

    let nextCursor = null;

    if (products.length > 0) {

      nextCursor =
        encodeCursor(
          products[
            products.length - 1
          ]
        );
    }

    res.json({
      snapshot_time: snapshotTime,
      next_cursor: nextCursor,
      products
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});


app.post("/products", async (req, res) => {
  try {
    const { name, category, price } = req.body;

    if (!name || !category || price == null) {
      return res.status(400).json({
        message: "name, category and price are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products
      (name, category, price, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *;
      `,
      [name, category, price]
    );

    res.status(201).json({
      message: "Product added successfully",
      product: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});